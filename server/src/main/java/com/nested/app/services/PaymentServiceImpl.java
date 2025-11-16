package com.nested.app.services;

import com.nested.app.client.mf.OrderApiClient;
import com.nested.app.client.mf.OtpApiClient;
import com.nested.app.client.mf.PaymentsAPIClient;
import com.nested.app.client.mf.dto.BulkOrderOtpRequest;
import com.nested.app.client.mf.dto.BulkOrderRequest;
import com.nested.app.client.mf.dto.ConfirmOrderRequest;
import com.nested.app.client.mf.dto.CreateMandateRequest;
import com.nested.app.client.mf.dto.OrderDetail;
import com.nested.app.client.mf.dto.OtpRequest;
import com.nested.app.client.mf.dto.PaymentsOrder;
import com.nested.app.client.mf.dto.PaymentsRequest;
import com.nested.app.client.mf.dto.SipOrderDetail;
import com.nested.app.client.tarrakki.MandateApiClient;
import com.nested.app.contect.UserContext;
import com.nested.app.dto.MinifiedOrderDTO;
import com.nested.app.dto.OrderDTO;
import com.nested.app.dto.PaymentDTO;
import com.nested.app.dto.PlaceOrderDTO;
import com.nested.app.dto.PlaceOrderPostDTO;
import com.nested.app.dto.UserActionRequest;
import com.nested.app.dto.VerifyOrderDTO;
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
import com.nested.app.repository.ChildRepository;
import com.nested.app.repository.GoalRepository;
import com.nested.app.repository.OrderRepository;
import com.nested.app.repository.PaymentRepository;
import com.nested.app.utils.IpUtils;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
  private final UserContext userContext;
  private final GoalRepository goalRepository;
  private final ChildRepository childRepository;

  private final OtpApiClient otpApiClient;
  private final MandateApiClient mandateApiClient;
  private final PaymentsAPIClient paymentsAPIClient;
  private final OrderApiClient orderApiClient;

  private static CreateMandateRequest getCreateMandateRequest(Payment payment) {
    var mandateRequest = new CreateMandateRequest();
    mandateRequest.setInvestor_id(payment.getInvestor().getRef());
    mandateRequest.setBank_id(payment.getBank().getRefId());
    if (payment.getPaymentType() == PlaceOrderPostDTO.PaymentMethod.UPI) {
      mandateRequest.setMandate_type(CreateMandateRequest.MandateType.UPI);
      mandateRequest.setUpi_id(payment.getUpiId());
    } else {
      mandateRequest.setMandate_type(CreateMandateRequest.MandateType.ENACH);
      mandateRequest.setCallback_url("https://nested.com/api/payments/mandate-callback");
    }
    return mandateRequest;
  }

  /**
   * Creates a payment with multiple orders for a child
   *
   * @param placeOrderRequest Order placement request data
   * @return Created payment with orders
   */
  @Override
  public PlaceOrderDTO createPaymentWithOrders(PlaceOrderPostDTO placeOrderRequest) {

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

      User user = userContext.getUser();

      // Create payment entity
      Payment payment = new Payment();
      payment.setStatus(Payment.PaymentStatus.PENDING);
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
      orders.forEach(order -> order.setPayment(payment));

      // Save payment and orders
      Payment savedPayment = paymentRepository.save(payment);

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

  /**
   * Verifies a payment using verification code
   *
   * @param verifyOrderRequest Payment verification request data
   * @return Verified payment data
   */
  @Override
  public PlaceOrderDTO verifyPayment(VerifyOrderDTO verifyOrderRequest) {
    log.info(
        "Verifying payment with verification code: {}", verifyOrderRequest.getVerificationCode());

    var payment = paymentRepository.findById(verifyOrderRequest.getId()).orElseThrow();

    var ids =
        payment.getOrders().stream().filter(BuyOrder.class::isInstance).map(Order::getRef).toList();

    var request =
        ConfirmOrderRequest.builder().email(payment.getUser().getEmail()).buyOrders(ids).build();
    orderApiClient.confirmOrder(request);
    return null;
  }

  @Override
  @Transactional
  public UserActionRequest fetchPaymentUrl(Long paymentID) {
    try {
      var payment = paymentRepository.findById(paymentID).orElseThrow();

      var ordersDetails =
          payment.getOrders().stream()
              .filter(BuyOrder.class::isInstance)
              .flatMap(this::convertOrderToOrderDetail)
              .toList();
      var bulkOrderRequest =
          BulkOrderRequest.builder()
              .auth_ref(payment.getVerificationRef())
              .detail(ordersDetails)
              .build();
      var orderResponse = orderApiClient.placeBulkOrder(bulkOrderRequest).block();
      if (orderResponse == null) {
        throw new RuntimeException("Failed to place bulk order with MF provider");
      }

      var morders = payment.getOrders().stream().filter(BuyOrder.class::isInstance).toList();
      for (var idx = 0; idx < orderResponse.data.size(); idx++) {
        var or = orderResponse.data.get(idx);
        var order = morders.get(idx);
        order.setRef(or.getRef());
        order.setPaymentRef(or.getPaymentRef());
      }

      paymentRepository.save(payment);

      var orders = orderRepository.findByPaymentId(paymentID);

      var paymentMethod =
          payment.getPaymentType() == PlaceOrderPostDTO.PaymentMethod.UPI
              ? PaymentsRequest.PaymentMethod.UPI
              : PaymentsRequest.PaymentMethod.NET_BANKING;

      var paymentRequest =
          PaymentsRequest.builder()
              .bankId(payment.getBank().getRefId())
              .paymentMethod(paymentMethod)
              .orders(orders.stream().map(Order::getPaymentRef).map(PaymentsOrder::new).toList())
              .build();

      var paymentResponse = paymentsAPIClient.createPayment(paymentRequest).block();
      if (paymentResponse == null) {
        throw new RuntimeException("Failed to initiate payment with MF provider");
      }
      payment.setPaymentUrl(paymentResponse.getRedirectUrl());
      payment.setRef(paymentResponse.getPaymentId());
      paymentRepository.save(payment);

      return UserActionRequest.builder()
          .id(payment.getId().toString())
          .redirectUrl(payment.getPaymentUrl())
          .build();
    } catch (WebClientResponseException e) {
      log.error(
          "Error from MF provider while initiating payment for ID {}: {}",
          paymentID,
          e.getResponseBodyAsString(),
          e);
      throw new RuntimeException(e);
    } catch (Exception e) {
      log.error("Error initiating payment: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to initiate payment", e);
    }
  }

  OrderDetail convertOrderToOrderDetail(BasketFund fund, Order order) {
    var orderUUID = order.getUuid();
    var accountID = order.getInvestor().getAccountRef();
    if (order instanceof SIPOrder sipOrder) {
      return SipOrderDetail.builder()
          .fundID(fund.getFund().getIsinCode())
          .mandateID(sipOrder.getMandateID())
          .startDate(sipOrder.getStartDate())
          .firstOrderToday(false)
          .sourceRef(orderUUID)
          .accountID(accountID)
          .build();
    }

    return OrderDetail.builder()
        .fundID(fund.getFund().getIsinCode())
        .sourceRef(orderUUID)
        .accountID(accountID)
        .build();
  }

  Stream<OrderDetail> convertOrderToOrderDetail(Order order) {
    var basketFunds = order.getGoal().getBasket().getBasketFunds();
    var totalAmount = order.getAmount();
    var amountAllocation =
        new java.util.ArrayList<>(
            basketFunds.stream()
                .map(f -> f.getAllocationPercentage() / 100.0 * totalAmount)
                .map(amount -> amount / 100 * 100)
                .toList());

    var totalAllocation = amountAllocation.stream().reduce(Double::sum).orElse(0.0);
    var correction = totalAmount - (totalAllocation - amountAllocation.getLast());
    amountAllocation.set(amountAllocation.size() - 1, correction);

    ServletRequestAttributes attributes =
        (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
    if (attributes == null) {
      throw new RuntimeException("Error while getting request");
    }
    HttpServletRequest request = attributes.getRequest();
    var ipAddress = IpUtils.getClientIpAddress(request);

    var orders = basketFunds.stream().map(f -> convertOrderToOrderDetail(f, order)).toList();

    for (int i = 0; i < amountAllocation.size(); i++) {
      var orderDetails = orders.get(i);
      orderDetails.setAmount(amountAllocation.get(i));
      orderDetails.setUserIP(ipAddress);
    }

    return orders.stream();
  }

  /**
   * Retrieves all payments
   *
   * @return List of all payments
   */
  @Override
  @Transactional(readOnly = true)
  public List<PaymentDTO> getAllPayments() {
    log.info("Retrieving all payments from database");

    try {
      List<Payment> payments = paymentRepository.findAll();
      List<PaymentDTO> paymentDTOs =
          payments.stream().map(this::convertPaymentToDTO).collect(Collectors.toList());

      log.info("Successfully retrieved {} payments", paymentDTOs.size());
      return paymentDTOs;

    } catch (Exception e) {
      log.error("Error retrieving all payments: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to retrieve payments", e);
    }
  }

  /**
   * Retrieves payment by ID
   *
   * @param paymentId Payment ID
   * @return Payment data
   */
  @Override
  @Transactional(readOnly = true)
  public PaymentDTO getPaymentById(Long paymentId) {
    log.info("Retrieving payment with ID: {}", paymentId);

    try {
      Payment payment =
          paymentRepository
              .findById(paymentId)
              .orElseThrow(
                  () -> new IllegalArgumentException("Payment not found with ID: " + paymentId));

      PaymentDTO paymentDTO = convertPaymentToDTO(payment);

      log.info("Successfully retrieved payment with ID: {}", paymentId);
      return paymentDTO;

    } catch (Exception e) {
      log.error("Error retrieving payment with ID {}: {}", paymentId, e.getMessage(), e);
      throw new RuntimeException("Failed to retrieve payment", e);
    }
  }

  /**
   * Retrieves payments by child ID
   *
   * @param childId Child ID
   * @return List of payments for the specified child
   */
  @Override
  @Transactional(readOnly = true)
  public List<PaymentDTO> getPaymentsByChildId(Long childId) {
    log.info("Retrieving payments for child ID: {}", childId);

    try {
      List<Payment> payments = paymentRepository.findByChildId(childId);
      List<PaymentDTO> paymentDTOs =
          payments.stream().map(this::convertPaymentToDTO).collect(Collectors.toList());

      log.info("Successfully retrieved {} payments for child ID: {}", paymentDTOs.size(), childId);
      return paymentDTOs;

    } catch (Exception e) {
      log.error("Error retrieving payments for child ID {}: {}", childId, e.getMessage(), e);
      throw new RuntimeException("Failed to retrieve payments for child", e);
    }
  }

  /**
   * Retrieves payments by user ID
   *
   * @param userId User ID
   * @return List of payments for the specified user
   */
  @Override
  @Transactional(readOnly = true)
  public List<PaymentDTO> getPaymentsByUserId(Long userId) {
    log.info("Retrieving payments for user ID: {}", userId);

    try {
      List<Payment> payments = paymentRepository.findByUserId(userId);
      List<PaymentDTO> paymentDTOs =
          payments.stream().map(this::convertPaymentToDTO).collect(Collectors.toList());

      log.info("Successfully retrieved {} payments for user ID: {}", paymentDTOs.size(), userId);
      return paymentDTOs;

    } catch (Exception e) {
      log.error("Error retrieving payments for user ID {}: {}", userId, e.getMessage(), e);
      throw new RuntimeException("Failed to retrieve payments for user", e);
    }
  }

  @Override
  public void markPaymentSuccess(String paymentRef) {
    var payment = paymentRepository.findByRef(paymentRef).orElseThrow();

    payment.getOrders().forEach(order -> order.setStatus(Order.OrderStatus.COMPLETED));
    payment.setStatus(Payment.PaymentStatus.COMPLETED);

    paymentRepository.save(payment);
  }

  @Override
  public void markPaymentFailure(String paymentRef) {
    var payment = paymentRepository.findByRef(paymentRef).orElseThrow();

    payment.getOrders().forEach(order -> order.setStatus(Order.OrderStatus.FAILED));
    payment.setStatus(Payment.PaymentStatus.FAILED);

    paymentRepository.save(payment);
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
    dto.setStatus(PaymentDTO.PaymentStatus.valueOf(payment.getStatus().name()));
    dto.setVerificationStatus(
        PaymentDTO.VerificationStatus.valueOf(payment.getVerificationStatus().name()));
    dto.setPaymentUrl(payment.getPaymentUrl());
    dto.setMandateType(PaymentDTO.MandateType.valueOf(payment.getPaymentType().name()));
    dto.setUpiId(payment.getUpiId());
    dto.setConfirmationUrl(payment.getMandateConfirmationUrl());
    dto.setUserId(payment.getUser().getId());
    dto.setChildId(payment.getChild().getId());
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
   * Converts Payment entity to PlaceOrderDTO
   *
   * @param payment Payment entity
   * @return PlaceOrderDTO
   */
  private PlaceOrderDTO convertPaymentToPlaceOrderDTO(Payment payment) {
    log.debug("Converting Payment entity to PlaceOrderDTO for ID: {}", payment.getId());

    PlaceOrderDTO dto = new PlaceOrderDTO();
    dto.setId(payment.getId());
    dto.setVerificationStatus(
        PaymentDTO.VerificationStatus.valueOf(payment.getVerificationStatus().name()));
    dto.setStatus(PaymentDTO.PaymentStatus.valueOf(payment.getStatus().name()));
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
}
