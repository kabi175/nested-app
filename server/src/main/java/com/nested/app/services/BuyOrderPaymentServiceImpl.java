package com.nested.app.services;

import com.nested.app.client.mf.BuyOrderApiClient;
import com.nested.app.client.mf.PaymentsAPIClient;
import com.nested.app.client.mf.dto.ConfirmOrderRequest;
import com.nested.app.client.mf.dto.OrderDetail;
import com.nested.app.client.mf.dto.PaymentsOrder;
import com.nested.app.client.mf.dto.PaymentsRequest;
import com.nested.app.dto.PlaceOrderDTO;
import com.nested.app.dto.PlaceOrderPostDTO;
import com.nested.app.dto.UserActionRequest;
import com.nested.app.dto.VerifyOrderDTO;
import com.nested.app.entity.BuyOrder;
import com.nested.app.entity.Order;
import com.nested.app.entity.OrderItems;
import com.nested.app.repository.OrderItemsRepository;
import com.nested.app.repository.OrderRepository;
import com.nested.app.repository.PaymentRepository;
import java.util.List;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClientResponseException;

/**
 * Service implementation for managing Buy Order Payment operations. Handles verification and
 * payment URL retrieval for buy orders specifically.
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BuyOrderPaymentServiceImpl implements BuyOrderPaymentService {

  private final PaymentRepository paymentRepository;
  private final OrderRepository orderRepository;
  private final BuyOrderApiClient buyOrderApiClient;
  private final PaymentsAPIClient paymentsAPIClient;
  private final PaymentServiceImpl paymentServiceHelper;
  private final OrderItemsRepository orderItemsRepository;

  /**
   * Verifies a buy order payment using verification code
   *
   * @param verifyOrderRequest Payment verification request data
   * @return Verified payment data
   */
  @Override
  public PlaceOrderDTO verifyBuyOrderPayment(VerifyOrderDTO verifyOrderRequest) {
    log.info(
        "Verifying buy order payment with verification code: {}",
        verifyOrderRequest.getVerificationCode());

    try {
      var payment = paymentRepository.findById(verifyOrderRequest.getId()).orElseThrow();

      var buyOrderIds =
          payment.getOrders().stream()
              .filter(BuyOrder.class::isInstance)
              .map(Order::getItems)
              .flatMap(List::stream)
              .map(OrderItems::getRef)
              .toList();

      if (buyOrderIds.isEmpty()) {
        log.warn("No buy orders found for payment ID: {}", verifyOrderRequest.getId());
        throw new IllegalArgumentException("No buy orders found for this payment");
      }

      var request =
          ConfirmOrderRequest.builder()
              .email(payment.getUser().getEmail())
              .buyOrders(buyOrderIds)
              .build();

      buyOrderApiClient.confirmBuyOrder(request).block();

      log.info(
          "Successfully verified {} buy orders for payment ID: {}",
          buyOrderIds.size(),
          verifyOrderRequest.getId());

      return paymentServiceHelper.convertPaymentToPlaceOrderDTO(payment);

    } catch (WebClientResponseException e) {
      log.error(
          "Error from MF provider while verifying buy order payment: {}",
          e.getResponseBodyAsString(),
          e);
      throw new RuntimeException(e);
    } catch (Exception e) {
      log.error("Error verifying buy order payment: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to verify buy order payment", e);
    }
  }

  /**
   * Fetches payment redirect URL for buy orders
   *
   * @param paymentID Payment ID
   * @return User action request with redirect URL
   */
  @Override
  @Transactional
  public UserActionRequest fetchBuyOrderPaymentUrl(Long paymentID) {
    log.info("Fetching buy order payment URL for payment ID: {}", paymentID);

    try {
      var payment = paymentRepository.findById(paymentID).orElseThrow();

      var buyOrdersDetails =
          payment.getOrders().stream()
              .filter(BuyOrder.class::isInstance)
              .flatMap(this::convertOrderToOrderDetail)
              .toList();

      if (buyOrdersDetails.isEmpty()) {
        log.warn("No buy orders found for payment ID: {}", paymentID);
        throw new IllegalArgumentException("No buy orders found for this payment");
      }

      var orderResponse = buyOrderApiClient.placeBuyOrder(buyOrdersDetails).block();
      if (orderResponse == null) {
        throw new RuntimeException("Failed to place buy order with MF provider");
      }

      var orderItemsList =
          payment.getOrders().stream()
              .filter(BuyOrder.class::isInstance)
              .map(Order::getItems)
              .flatMap(List::stream)
              .toList();

      for (var idx = 0; idx < orderResponse.data.size(); idx++) {
        var orderResponseItem = orderResponse.data.get(idx);
        var orderItem = orderItemsList.get(idx);
        log.debug(
            "Updating OrderItems: id={}, existingRef={}, existingPaymentRef={}, newRef={}, newPaymentRef={}",
            orderItem.getId(),
            orderItem.getRef(),
            orderItem.getPaymentRef(),
            orderResponseItem.getRef(),
            orderResponseItem.getPaymentRef());
        orderItem.setRef(orderResponseItem.getRef());
        orderItem.setPaymentRef(orderResponseItem.getPaymentRef());
      }

      // Persist only newly created OrderItems (those without an id). Managed entities with an id
      // will be auto-dirtied and flushed by JPA, preventing duplicate inserts.
      var newItems = orderItemsList.stream().filter(i -> i.getId() == null).toList();
      if (!newItems.isEmpty()) {
        log.debug("Persisting {} new OrderItems without IDs", newItems.size());
        orderItemsRepository.saveAll(newItems);
      }

      paymentRepository.save(payment);

      var orders = orderRepository.findByPaymentId(paymentID);

      var paymentMethod =
          payment.getPaymentType() == PlaceOrderPostDTO.PaymentMethod.UPI
              ? PaymentsRequest.PaymentMethod.UPI
              : PaymentsRequest.PaymentMethod.NET_BANKING;

      var paymentRequest =
          PaymentsRequest.builder()
              .bankId(payment.getBank().getPaymentRef())
              .paymentMethod(paymentMethod)
              .orders(
                  orders.stream()
                      .filter(BuyOrder.class::isInstance)
                      .map(Order::getItems)
                      .flatMap(List::stream)
                      .map(OrderItems::getPaymentRef)
                      .map(PaymentsOrder::new)
                      .toList())
              .build();

      // Wait 10 seconds before initiating payment creation
      try {
        log.info(
            "Waiting 10 seconds before initiating payment creation for payment ID: {}", paymentID);
        Thread.sleep(5_000L);
      } catch (InterruptedException ie) {
        Thread.currentThread().interrupt();
        log.warn("Sleep interrupted before payment creation for payment ID: {}", paymentID);
      }

      var paymentResponse = paymentsAPIClient.createPayment(paymentRequest).block();
      if (paymentResponse == null) {
        throw new RuntimeException("Failed to initiate payment with MF provider");
      }

      payment.setPaymentUrl(paymentResponse.getRedirectUrl());
      payment.setRef(paymentResponse.getPaymentId());
      paymentRepository.save(payment);

      log.info("Successfully fetched buy order payment URL for payment ID: {}", paymentID);

      return UserActionRequest.builder()
          .id(payment.getId().toString())
          .redirectUrl(payment.getPaymentUrl())
          .build();

    } catch (WebClientResponseException e) {
      log.error(
          "Error from MF provider while fetching buy order payment URL for ID {}: {}",
          paymentID,
          e.getResponseBodyAsString(),
          e);
      throw new RuntimeException(e);
    } catch (Exception e) {
      log.error("Error fetching buy order payment URL: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to fetch buy order payment URL", e);
    }
  }

  private Stream<OrderDetail> convertOrderToOrderDetail(Order order) {
    return paymentServiceHelper.convertOrderToOrderDetail(order);
  }
}
