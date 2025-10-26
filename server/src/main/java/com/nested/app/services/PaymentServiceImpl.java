package com.nested.app.services;

import com.nested.app.client.mf.OrderApiClient;
import com.nested.app.client.mf.OtpApiClient;
import com.nested.app.client.mf.PaymentsAPIClient;
import com.nested.app.client.tarrakki.MandateApiClient;
import com.nested.app.client.tarrakki.dto.BulkOrderOtpRequest;
import com.nested.app.client.tarrakki.dto.BulkOrderRequest;
import com.nested.app.client.tarrakki.dto.CreateMandateRequest;
import com.nested.app.client.tarrakki.dto.OrderDetail;
import com.nested.app.client.tarrakki.dto.OtpRequest;
import com.nested.app.client.tarrakki.dto.OtpVerifyRequest;
import com.nested.app.client.tarrakki.dto.PaymentsOrder;
import com.nested.app.client.tarrakki.dto.PaymentsRequest;
import com.nested.app.client.tarrakki.dto.SipOrderDetail;
import com.nested.app.dto.MinifiedOrderDTO;
import com.nested.app.dto.OrderDTO;
import com.nested.app.dto.PaymentDTO;
import com.nested.app.dto.PlaceOrderDTO;
import com.nested.app.dto.PlaceOrderPostDTO;
import com.nested.app.dto.VerifyOrderDTO;
import com.nested.app.entity.BankDetail;
import com.nested.app.entity.Basket;
import com.nested.app.entity.BasketFund;
import com.nested.app.entity.Child;
import com.nested.app.entity.Fund;
import com.nested.app.entity.Goal;
import com.nested.app.entity.Order;
import com.nested.app.entity.Payment;
import com.nested.app.entity.SIPOrder;
import com.nested.app.entity.User;
import com.nested.app.repository.ChildRepository;
import com.nested.app.repository.GoalRepository;
import com.nested.app.repository.OrderRepository;
import com.nested.app.repository.PaymentRepository;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
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
   * @param childId Child ID to create payment for
   * @param placeOrderRequest Order placement request data
   * @return Created payment with orders
   */
  @Override
  public PlaceOrderDTO createPaymentWithOrders(Long childId, PlaceOrderPostDTO placeOrderRequest) {
    log.info("Creating payment with orders for child ID: {}", childId);

    try {
      // Get child and user information
      Child child =
          childRepository
              .findById(childId)
              .orElseThrow(
                  () -> new IllegalArgumentException("Child not found with ID: " + childId));

      User user = child.getUser();

      // Get active goals for the child
      List<Goal> activeGoals = goalRepository.findByChildIdAndStatus(childId, Goal.Status.DRAFT);

      if (activeGoals.isEmpty()) {
        throw new IllegalArgumentException("No active goals found for child ID: " + childId);
      }

      // Create payment entity
      Payment payment = new Payment();
      payment.setStatus(Payment.PaymentStatus.PENDING);
      payment.setVerificationStatus(Payment.VerificationStatus.PENDING);
      payment.setUser(user);
      payment.setChild(child);
      payment.setInvestor(child.getInvestor());

      // Set mandate information
      payment.setPaymentType(placeOrderRequest.getPaymentMethod());
      if (placeOrderRequest.getPaymentMethod() == PlaceOrderPostDTO.PaymentMethod.UPI) {
        payment.setUpiId(placeOrderRequest.getUpiID());
      }
      var bankDetail = new BankDetail();
      bankDetail.setId(placeOrderRequest.getBankID());
      payment.setBank(bankDetail);

      var orderIds = placeOrderRequest.getOrders().stream().map(MinifiedOrderDTO::getId).toList();
      // Create orders for each order request
      List<Order> orders = orderRepository.findAllById(orderIds);

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

      log.info(
          "Successfully created payment with {} orders for child ID: {}", orders.size(), childId);
      return placeOrderDTO;

    } catch (WebClientResponseException e) {
      log.error(
          " Error from MF provider while creating payment with orders for child ID {}: {}",
          childId,
          e.getResponseBodyAsString(),
          e);

      throw new RuntimeException(e);
    } catch (Exception e) {
      log.error(
          "Error creating payment with orders for child ID {}: {}", childId, e.getMessage(), e);
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

    try {
      Optional<Payment> paymentOpt = paymentRepository.findById(verifyOrderRequest.getId());

      if (paymentOpt.isEmpty()) {
        throw new IllegalArgumentException(
            "Payment not found with verification code: "
                + verifyOrderRequest.getVerificationCode());
      }

      Payment payment = paymentOpt.get();

      // Verify the verification code
      var verifyReq = new OtpVerifyRequest();
      // TODO: determine otp type based on order types
      verifyReq.setOtp_type(OtpRequest.Type.BULK_ORDERS);
      verifyReq.setOtp(verifyOrderRequest.getVerificationCode());
      var isValidOtp = otpApiClient.verifyOtp(payment.getVerificationRef(), verifyReq).block();
      if (Boolean.FALSE.equals(isValidOtp)) {
        throw new IllegalArgumentException("Invalid verification code provided");
      }

      // TODO: use setup amount to compute this properly
      var mandateAmount =
          payment.getOrders().stream()
              .filter(order -> order instanceof SIPOrder)
              .map(SIPOrder.class::cast)
              .map(SIPOrder::getAmount)
              .reduce(Double::sum);
      // Verification successful
      payment.setVerificationStatus(Payment.VerificationStatus.VERIFIED);

      if (mandateAmount.isPresent() && mandateAmount.get() > 0) {
        // TODO: handle the CreateMandateRequest properly
        var mandateRequest = getCreateMandateRequest(payment);
        mandateRequest.setAuto_debit_limit(mandateAmount.get());
        var mandateResponse = mandateApiClient.create(mandateRequest).block();

        if (mandateResponse == null) {
          throw new RuntimeException("Failed to create mandate with MF provider");
        }

        payment.setMandateConfirmationUrl(mandateResponse.getRedirection_url());
      }
      Payment savedPayment = paymentRepository.save(payment);

      PlaceOrderDTO verifiedPayment = convertPaymentToPlaceOrderDTO(savedPayment);

      log.info("Successfully verified payment with ID: {}", payment.getId());
      return verifiedPayment;

    } catch (Exception e) {
      log.error("Error verifying payment: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to verify payment", e);
    }
  }

  @Override
  @Transactional
  public PaymentDTO iniatePayment(Long paymentID, String ipAddress) {
    try {
      var payment = paymentRepository.findById(paymentID).orElseThrow();

      var bulkOrderRequest =
          BulkOrderRequest.builder()
              .investor_id(payment.getInvestor().getRef())
              .auth_ref(payment.getVerificationRef())
              .investorIP(ipAddress)
              .detail(
                  payment.getOrders().stream().flatMap(this::convertOrderToOrderDetail).toList())
              .build();
      var orderResponse = orderApiClient.placeBulkOrder(bulkOrderRequest).block();
      if (orderResponse == null) {
        throw new RuntimeException("Failed to place bulk order with MF provider");
      }
      payment.setOrderRef(orderResponse.getBulk_order_id());
      paymentRepository.save(payment);

      var orders = orderRepository.findByPaymentId(paymentID);
      var totalAmount = orders.stream().map(Order::getAmount).reduce(Double::sum).orElseThrow();

      var paymentMethod =
          payment.getPaymentType() == PlaceOrderPostDTO.PaymentMethod.UPI
              ? PaymentsRequest.PaymentMethod.UPI
              : PaymentsRequest.PaymentMethod.NET_BANKING;

      var paymentRequest =
          PaymentsRequest.builder()
              .investor_id(payment.getInvestor().getRef())
              .bank_id(payment.getBank().getRefId())
              .payment_method(paymentMethod)
              .upi_id(payment.getUpiId())
              .amount(totalAmount)
              .orders(List.of(new PaymentsOrder(payment.getOrderRef())))
              .build();

      var paymentResponse = paymentsAPIClient.createPayment(paymentRequest).block();
      if (paymentResponse == null) {
        throw new RuntimeException("Failed to initiate payment with MF provider");
      }
      payment.setPaymentUrl(paymentResponse.getRedirectUrl());
      payment.setRef(paymentResponse.getPaymentId());
      paymentRepository.save(payment);

      return convertPaymentToDTO(payment);
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
    if (order instanceof SIPOrder sipOrder) {
      return SipOrderDetail.builder()
          .fundID(fund.getFund().getId().toString())
          .mandateID(sipOrder.getMandateID())
          .startDate(sipOrder.getStartDate())
          .firstOrderToday(false)
          .build();
    }

    return OrderDetail.builder().fundID(fund.getFund().getId().toString()).build();
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

    var orders = basketFunds.stream().map(f -> convertOrderToOrderDetail(f, order)).toList();

    for (int i = 0; i < amountAllocation.size(); i++) {
      orders.get(i).setAmount(amountAllocation.get(i));
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

    OrderDTO dto = new OrderDTO();
    dto.setId(order.getId());
    dto.setAmount(order.getAmount());
    dto.setStatus(order.getStatus());
    dto.setCreatedAt(order.getCreatedAt());
    dto.setUpdatedAt(order.getUpdatedAt());

    return dto;
  }
}
