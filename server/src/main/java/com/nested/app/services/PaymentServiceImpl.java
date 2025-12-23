package com.nested.app.services;

import com.nested.app.client.mf.BuyOrderApiClient;
import com.nested.app.client.mf.MandateApiClient;
import com.nested.app.client.mf.OtpApiClient;
import com.nested.app.client.mf.dto.BulkOrderOtpRequest;
import com.nested.app.client.mf.dto.MandateDto;
import com.nested.app.client.mf.dto.OrderDetail;
import com.nested.app.client.mf.dto.OtpRequest;
import com.nested.app.client.mf.dto.SipOrderDetail;
import com.nested.app.dto.MinifiedOrderDTO;
import com.nested.app.dto.OrderDTO;
import com.nested.app.dto.PaymentDTO;
import com.nested.app.dto.PlaceOrderDTO;
import com.nested.app.dto.PlaceOrderPostDTO;
import com.nested.app.entity.BankDetail;
import com.nested.app.entity.Basket;
import com.nested.app.entity.BasketFund;
import com.nested.app.entity.BuyOrder;
import com.nested.app.entity.Fund;
import com.nested.app.entity.Goal;
import com.nested.app.entity.Investor;
import com.nested.app.entity.Order;
import com.nested.app.entity.Payment;
import com.nested.app.entity.SIPOrder;
import com.nested.app.entity.User;
import com.nested.app.events.OrderItemsRefUpdatedEvent;
import com.nested.app.repository.BankDetailRepository;
import com.nested.app.repository.FolioRepository;
import com.nested.app.repository.OrderRepository;
import com.nested.app.repository.PaymentRepository;
import com.nested.app.utils.IpUtils;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.reactive.function.client.WebClientResponseException;

/**
 * Service implementation for managing Payment entities Provides business logic for payment-related
 * operations
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class PaymentServiceImpl implements PaymentService {

  private final PaymentRepository paymentRepository;
  private final OrderRepository orderRepository;
  private final BankDetailRepository bankDetailRepository;
  private final FolioRepository folioRepository;
  private final BuyOrderApiClient buyOrderApiClient;
  private final MandateApiClient mandateApiClient;
  private final ApplicationEventPublisher eventPublisher;

  private final OtpApiClient otpApiClient;

  /**
   * Creates a payment with multiple orders for a child
   *
   * @param placeOrderRequest Order placement request data
   * @param user Current user context
   * @return Created payment with orders
   */
  @Override
  public PlaceOrderDTO createPaymentWithOrders(
      PlaceOrderPostDTO placeOrderRequest, com.nested.app.entity.User user) {

    try {
      var orderIds = placeOrderRequest.getOrders().stream().map(MinifiedOrderDTO::getId).toList();
      // Create orders for each order request
      List<Order> orders = orderRepository.findAllById(orderIds);

      if (orders.size() != orderIds.size()) {
        throw new IllegalArgumentException("Some orders not found for the provided IDs");
      }

      if (orders.stream().map(Order::getInvestor).anyMatch(Objects::isNull)) {
        throw new IllegalArgumentException("All orders must have an associated investor");
      }

      if (orders.stream().map(Order::getInvestor).map(Investor::getId).distinct().count() > 1) {
        throw new IllegalArgumentException("All orders must belong to the same investor");
      }

      var investor = orders.getFirst().getInvestor();


      // Create payment entity
      Payment payment = new Payment();
      payment.setVerificationStatus(Payment.VerificationStatus.PENDING);
      payment.setUser(user);
      payment.setInvestor(investor);

      // Set mandate information
      payment.setPaymentType(placeOrderRequest.getPaymentMethod());
      if (placeOrderRequest.getPaymentMethod() == PlaceOrderPostDTO.PaymentMethod.UPI) {
        payment.setUpiId(placeOrderRequest.getUpiID());
      }
      var bankDetail = new BankDetail();
      bankDetail.setId(placeOrderRequest.getBankID());
      payment.setBank(bankDetail);

      var otpDetails =
          orders.stream()
              .map(Order::getGoal)
              .map(Goal::getBasket)
              .map(Basket::getBasketFunds)
              .flatMap(List::stream)
              .map(BasketFund::getFund)
              .map(Fund::getId)
              .distinct()
              .mapToInt(Long::intValue)
              .mapToObj(Long::toString)
              .map(BulkOrderOtpRequest::getDetail)
              .toList();

      OtpRequest otpRequest =
          BulkOrderOtpRequest.getInstance(payment.getInvestor().getRef(), otpDetails);

      var otpResp = otpApiClient.sendOtp(otpRequest).block();
      if (otpResp == null) {
        throw new RuntimeException("Failed to get OTP from MF provider");
      }
      payment.setVerificationRef(otpResp.getOtpId());

      payment.setOrders(orders);
      if (orders.stream().anyMatch(BuyOrder.class::isInstance)) {
        payment.setBuyStatus(Payment.PaymentStatus.PENDING);
      }
      if (orders.stream().anyMatch(SIPOrder.class::isInstance)) {
        payment.setSipStatus(Payment.PaymentStatus.PENDING);
      }

      orders.forEach(order -> order.setPayment(payment));

      if (payment.getSipStatus() == Payment.PaymentStatus.PENDING) {
        // create mandate for SIP orders
        createMandateWithExternalAPI(payment);
      }

      // Save payment and orders
      Payment savedPayment = paymentRepository.save(payment);

      if (payment.getBuyStatus() == Payment.PaymentStatus.PENDING) {
        // place buy orders in the external system
        placeOrderWithExternalAPI(savedPayment);
      }

      // Convert to DTO
      PlaceOrderDTO placeOrderDTO = convertPaymentToPlaceOrderDTO(savedPayment);

      log.info("Successfully created payment with {} orders ", orders.size());
      return placeOrderDTO;

    } catch (WebClientResponseException e) {
      log.error(
          " Error from MF provider while creating payment with orders: {}",
          e.getResponseBodyAsString(),
          e);

      throw new RuntimeException(e);
    } catch (Exception e) {
      log.error("Error creating payment with orders: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to create payment with orders", e);
    }
  }

  private void createMandateWithExternalAPI(Payment payment) {
    var sipOrders =
        payment.getOrders().stream()
            .filter(SIPOrder.class::isInstance)
            .map(SIPOrder.class::cast)
            .toList();

    // TODO: compute the  mandate amount order amount & setup amount
    var totalAmount = sipOrders.stream().map(SIPOrder::getAmount).reduce(0d, Double::sum);

    var bank = bankDetailRepository.findById(payment.getBank().getId()).orElseThrow();
    var mandate =
        mandateApiClient
            .createMandate(
                MandateDto.builder()
                    .amount(totalAmount)
                    .bankAccount(bank.getPaymentRef().toString())
                    .startDate(LocalDate.now())
                    .endDate(LocalDate.now().plusYears(29))
                    .build())
            .block();
    if (mandate == null) {
      log.error("mandate creation failed for payment {}", payment.getId());
      return;
    }

    // Store mandate details in Payment
    payment.setMandateID(mandate.getId());
    payment.setMandateRef(mandate.getRef());
  }

  private void placeOrderWithExternalAPI(Payment payment) {
    var orders = payment.getOrders();

    var buyOrdersDetails =
        orders.stream()
            .filter(BuyOrder.class::isInstance)
            .flatMap((o) -> this.convertOrderToOrderDetail(o, payment.getUser()))
            .toList();

    if (buyOrdersDetails.isEmpty()) {
      log.warn("No buy orders found for payment ID: {}", payment.getId());
      throw new IllegalArgumentException("No buy orders found for this payment");
    }

    var groupedOrders =
        buyOrdersDetails.stream().collect(Collectors.groupingBy(OrderDetail::getFundID));

    buyOrdersDetails =
        groupedOrders.values().stream()
            .map(
                orderList -> {
                  var o1 = orderList.getFirst();

                  var total =
                      orderList.stream().map(OrderDetail::getAmount).reduce(0d, Double::sum);

                  o1.setAmount(total);
                  return o1;
                })
            .toList();

    var orderResponse = buyOrderApiClient.placeBuyOrder(buyOrdersDetails).block();
    if (orderResponse == null) {
      throw new RuntimeException("Failed to place buy order with MF provider");
    }

    var orderItemsList =
        orders.stream()
            .filter(BuyOrder.class::isInstance)
            .map(Order::getItems)
            .flatMap(List::stream)
            .toList();

    for (var orderResponseItem : orderResponse.data) {
      orderItemsList.stream()
          .filter(
              orderItems ->
                  orderItems.getFund().getIsinCode().equals(orderResponseItem.getFundId()))
          .forEach(
              orderItem -> {
                log.debug(
                    "Updating OrderItems: id={}, existingRef={}, existingPaymentRef={}, newRef={}, newPaymentRef={}",
                    orderItem.getId(),
                    orderItem.getRef(),
                    orderItem.getPaymentRef(),
                    orderResponseItem.getRef(),
                    orderResponseItem.getPaymentRef());
                orderItem.setRef(orderResponseItem.getRef());
                orderItem.setPaymentRef(orderResponseItem.getPaymentRef());
              });
    }

    // Collect all order items with updated ref and publish a single batched event
    List<OrderItemsRefUpdatedEvent.OrderItemRefInfo> orderItemRefInfos = new ArrayList<>();
    for (var orderItem : orderItemsList) {
      if (orderItem.getRef() != null && orderItem.getOrder() != null) {
        orderItemRefInfos.add(
            new OrderItemsRefUpdatedEvent.OrderItemRefInfo(
                orderItem.getOrder().getId(),
                orderItem.getRef(),
                orderItem.getId(),
                OrderDTO.OrderType.BUY));
      }
    }

    if (!orderItemRefInfos.isEmpty()) {
      var batchEvent = new OrderItemsRefUpdatedEvent(this, orderItemRefInfos, payment.getId());
      eventPublisher.publishEvent(batchEvent);
      log.debug(
          "Published OrderItemsRefUpdatedEvent for Payment ID: {} with {} order items",
          payment.getId(),
          orderItemRefInfos.size());
    }
  }

  /**
   * Populates order items for an order based on its basket funds and allocation
   *
   * @param order Order to populate items for
   */
  Stream<OrderDetail> convertOrderToOrderDetail(Order order, User user) {
    ServletRequestAttributes attributes =
        (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
    if (attributes == null) {
      throw new RuntimeException("Error while getting request");
    }
    HttpServletRequest request = attributes.getRequest();
    var ipAddress = IpUtils.getClientIpAddress(request);

    var accountID = order.getInvestor().getAccountRef();

    return order.getItems().stream()
        .map(
            item -> {
              // Fetch folio for the fund
              String folioNumber = null;
              var folioOptional =
                  folioRepository.findFirstByFundIdAndUser(item.getFund().getId(), user);
              if (folioOptional.isPresent()) {
                folioNumber = folioOptional.get().getRef();
              }

              OrderDetail orderDetail;
              if (order instanceof SIPOrder sipOrder) {
                Payment payment = order.getPayment();
                Long mandateID = payment != null ? payment.getMandateID() : null;
                if (mandateID == null) {
                  throw new IllegalArgumentException(
                      "SIP order must have a mandate ID assigned via Payment");
                }
                orderDetail =
                    SipOrderDetail.builder()
                        .fundID(item.getFund().getIsinCode())
                        .mandateID(mandateID.toString())
                        .startDate(sipOrder.getStartDate())
                        .firstOrderToday(false)
                        .accountID(accountID)
                        .amount(item.getAmount())
                        .userIP(ipAddress)
                        .folio(folioNumber)
                        .userIP(ipAddress)
                        .installmentDay(String.valueOf(sipOrder.getStartDate().getDayOfMonth()))
                        .email(user.getEmail())
                        .mobile(user.getPhoneNumber())
                        .build();
              } else {
                orderDetail =
                    OrderDetail.builder()
                        .fundID(item.getFund().getIsinCode())
                        .accountID(accountID)
                        .amount(item.getAmount())
                        .userIP(ipAddress)
                        .folio(folioNumber)
                        .build();
              }
              return orderDetail;
            });
  }

  /**
   * Converts Payment entity to PaymentDTO
   *
   * @param payment Payment entity
   * @return PaymentDTO
   */
  private PaymentDTO convertPaymentToDTO(Payment payment) {
    log.debug("Converting Payment entity to DTO for ID: {}", payment.getId());

    PaymentDTO dto = new PaymentDTO();
    dto.setId(payment.getId());
    dto.setBuyStatus(payment.getBuyStatus());
    dto.setSipStatus(payment.getSipStatus());
    dto.setVerificationStatus(payment.getVerificationStatus());
    dto.setPaymentUrl(payment.getPaymentUrl());
    dto.setMandateType(PaymentDTO.MandateType.valueOf(payment.getPaymentType().name()));
    dto.setMandateID(payment.getMandateID());
    dto.setUpiId(payment.getUpiId());
    dto.setConfirmationUrl(payment.getMandateConfirmationUrl());
    dto.setUserId(payment.getUser().getId());
    dto.setCreatedAt(payment.getCreatedAt());
    dto.setUpdatedAt(payment.getUpdatedAt());

    // Convert orders
    if (payment.getOrders() != null) {
      List<OrderDTO> orderDTOs =
          payment.getOrders().stream().map(this::convertOrderToDTO).collect(Collectors.toList());
      dto.setOrders(orderDTOs);
    }

    return dto;
  }

  /**
   * Converts Payment entity to PlaceOrderDTO Public method for use by related payment services
   *
   * @param payment Payment entity
   * @return PlaceOrderDTO
   */
  public PlaceOrderDTO convertPaymentToPlaceOrderDTO(Payment payment) {
    log.debug("Converting Payment entity to PlaceOrderDTO for ID: {}", payment.getId());

    PlaceOrderDTO dto = new PlaceOrderDTO();
    dto.setId(payment.getId());
    dto.setVerificationStatus(payment.getVerificationStatus());
    dto.setBuyStatus(payment.getBuyStatus());
    dto.setSipStaus(payment.getSipStatus());
    dto.setPaymentUrl(payment.getPaymentUrl());
    dto.setPaymentMethod(payment.getPaymentType());

    // Set mandate information
    PlaceOrderDTO.MandateDTO mandate = new PlaceOrderDTO.MandateDTO();
    mandate.setUpiId(payment.getUpiId());
    mandate.setConfirmationUrl(payment.getMandateConfirmationUrl());
    dto.setMandate(mandate);

    // Convert orders
    if (payment.getOrders() != null) {
      List<OrderDTO> orderDTOs =
          payment.getOrders().stream().map(this::convertOrderToDTO).collect(Collectors.toList());
      dto.setOrders(orderDTOs);
    }

    return dto;
  }

  /**
   * Converts Order entity to OrderDTO
   *
   * @param order Order entity
   * @return OrderDTO
   */
  private OrderDTO convertOrderToDTO(Order order) {
    log.debug("Converting Order entity to DTO for ID: {}", order.getId());
    return OrderDTO.fromEntity(order);
  }

  /**
   * Retrieves a payment by ID
   *
   * @param paymentId Payment ID
   * @return Payment details with orders
   */
  @Override
  public PaymentDTO getPaymentById(Long paymentId) {
    log.info("Fetching payment with ID: {}", paymentId);

    Payment payment =
        paymentRepository
            .findById(paymentId)
            .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));

    return convertPaymentToDTO(payment);
  }
}
