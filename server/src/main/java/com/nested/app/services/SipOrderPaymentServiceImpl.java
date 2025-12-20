package com.nested.app.services;

import com.nested.app.client.mf.MandateApiClient;
import com.nested.app.client.mf.SipOrderApiClient;
import com.nested.app.client.mf.dto.OrderDetail;
import com.nested.app.client.mf.dto.SipOrderDetail;
import com.nested.app.dto.UserActionRequest;
import com.nested.app.entity.Order;
import com.nested.app.entity.OrderItems;
import com.nested.app.entity.Payment;
import com.nested.app.entity.SIPOrder;
import com.nested.app.events.OrderItemsRefUpdatedEvent;
import com.nested.app.repository.OrderItemsRepository;
import com.nested.app.repository.PaymentRepository;
import com.nested.app.repository.TenantAwareGoalRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClientResponseException;

/**
 * Service implementation for managing SIP Order Payment operations. Handles verification and
 * payment URL retrieval for SIP orders specifically.
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class SipOrderPaymentServiceImpl implements SipOrderPaymentService {

  private final PaymentRepository paymentRepository;
  private final SipOrderApiClient sipOrderApiClient;
  private final PaymentServiceImpl paymentServiceHelper;
  private final OrderItemsRepository orderItemsRepository;
  private final TenantAwareGoalRepository goalRepository;
  private final ApplicationEventPublisher eventPublisher;
  private final MandateApiClient mandateApiClient;
  private final SipOrderSchedulerService sipOrderSchedulerService;

  /**
   * Verifies a SIP order payment using verification code
   *
   * @param paymentID Payment id
   */
  @Override
  public void verifySipOrderPayment(Long paymentID) {
    log.info("Verifying SIP order for payment ID: {}", paymentID);

    try {
      var payment = paymentRepository.findById(paymentID).orElseThrow();

      var sipOrders = payment.getOrders().stream().filter(SIPOrder.class::isInstance).toList();
      var sipOrderIds =
          sipOrders.stream()
              .map(Order::getItems)
              .flatMap(List::stream)
              .map(OrderItems::getRef)
              .toList();

      if (sipOrderIds.isEmpty()) {
        log.warn("No SIP orders found for payment ID: {}", paymentID);
        throw new IllegalArgumentException("No SIP orders found for this payment");
      }

      sipOrderApiClient.confirmOrder(sipOrderIds).block();

      sipOrders.forEach(
          sipOrder -> {
            var goal = goalRepository.findById(sipOrder.getGoal().getId()).orElseThrow();
            var goalSIPAmount = goal.getMonthlySip() + sipOrder.getAmount();
            goal.setMonthlySip(goalSIPAmount);
            goalRepository.save(goal);
          });

      log.info(
          "Successfully verified {} SIP orders for payment ID: {}", sipOrderIds.size(), paymentID);

    } catch (WebClientResponseException e) {
      log.error(
          "Error from MF provider while verifying SIP order payment: {}",
          e.getResponseBodyAsString(),
          e);
      throw new RuntimeException(e);
    } catch (Exception e) {
      log.error("Error verifying SIP order payment: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to verify SIP order payment", e);
    }
  }

  /**
   * Fetches payment redirect URL for SIP orders
   *
   * @param paymentID Payment ID
   * @return User action request with redirect URL
   */
  @Override
  @Transactional
  public UserActionRequest fetchSipOrderPaymentUrl(Long paymentID) {
    var payment = paymentRepository.findById(paymentID).orElseThrow();

    Long mandateID = payment.getMandateID();
    if (mandateID == null) {
      throw new IllegalArgumentException("Payment does not have a mandate ID");
    }

    var resp = mandateApiClient.authorizeMandate(mandateID).block();
    if (resp == null) {
      return null;
    }

    return UserActionRequest.builder().redirectUrl(resp.getRedirectUrl()).build();
  }

  @Override
  public void placeSipOrders(Payment payment) {
    var paymentID = payment.getId();
    log.info("Fetching SIP order payment URL for payment ID: {}", paymentID);
    try {
      if (payment.getSipStatus() == Payment.PaymentStatus.NOT_AVAILABLE) {
        throw new IllegalArgumentException("No SIP orders found for this payment");
      }

      var sipOrdersDetails =
          payment.getOrders().stream()
              .filter(SIPOrder.class::isInstance)
              .flatMap(this::convertOrderToOrderDetail)
              .toList();

      if (sipOrdersDetails.isEmpty()) {
        log.warn("No SIP orders found for payment ID: {}", paymentID);
        throw new IllegalArgumentException("No SIP orders found for this payment");
      }

      // Cast only SIP order details to SipOrderDetail list
      var sipPlanDetails =
          sipOrdersDetails.stream()
              .filter(SipOrderDetail.class::isInstance)
              .map(SipOrderDetail.class::cast)
              .toList();

      var orderResponse = sipOrderApiClient.placeSipOrder(sipPlanDetails).block();
      if (orderResponse == null) {
        throw new RuntimeException("Failed to place SIP order with MF provider");
      }

      var orderItems =
          payment.getOrders().stream()
              .filter(SIPOrder.class::isInstance)
              .map(Order::getItems)
              .flatMap(List::stream)
              .toList();

      if (orderResponse.data.size() != orderItems.size()) {
        log.error(
            "Mismatch between SIP provider response count ({}) and local order items ({}) for payment ID {}",
            orderResponse.data.size(),
            orderItems.size(),
            paymentID);
        throw new IllegalStateException(
            "Provider SIP order count does not match local allocated order items count");
      }

      for (var idx = 0; idx < orderResponse.data.size(); idx++) {
        var orderResponseItem = orderResponse.data.get(idx);
        var orderItem = orderItems.get(idx);
        orderItem.setRef(orderResponseItem.getRef());
        orderItem.setPaymentRef(orderResponseItem.getPaymentRef());
      }

      // Persist updated SIP order items (refs/paymentRefs) explicitly before saving payment
      orderItemsRepository.saveAll(orderItems);

      // Collect all order items with updated ref and publish a single batched event
      List<OrderItemsRefUpdatedEvent.OrderItemRefInfo> orderItemRefInfos = new ArrayList<>();
      for (var orderItem : orderItems) {
        if (orderItem.getRef() != null && orderItem.getOrder() != null) {
          orderItemRefInfos.add(
              new OrderItemsRefUpdatedEvent.OrderItemRefInfo(
                  orderItem.getOrder().getId(), orderItem.getRef(), orderItem.getId()));
        }
      }

      if (!orderItemRefInfos.isEmpty()) {
        var batchEvent = new OrderItemsRefUpdatedEvent(this, orderItemRefInfos, paymentID);
        eventPublisher.publishEvent(batchEvent);
        log.debug(
            "Published OrderItemsRefUpdatedEvent for Payment ID: {} with {} order items",
            paymentID,
            orderItemRefInfos.size());
      }

      payment.setSipStatus(Payment.PaymentStatus.ACTIVE);
      paymentRepository.save(payment);

      // Schedule verification job to run 10 seconds after successful placement
      try {
        sipOrderSchedulerService.scheduleVerificationJob(paymentID);
      } catch (Exception e) {
        log.warn(
            "Failed to schedule verification job for payment ID: {}. Error: {}",
            paymentID,
            e.getMessage());
        // Continue without throwing - payment was already saved successfully
      }

    } catch (WebClientResponseException e) {
      log.error(
          "Error from MF provider while fetching SIP order payment URL for ID {}: {}",
          paymentID,
          e.getResponseBodyAsString(),
          e);
      throw new RuntimeException(e);
    } catch (Exception e) {
      log.error("Error fetching SIP order payment URL: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to fetch SIP order payment URL", e);
    }
  }

  private Stream<OrderDetail> convertOrderToOrderDetail(Order order) {
    return paymentServiceHelper.convertOrderToOrderDetail(order);
  }
}
