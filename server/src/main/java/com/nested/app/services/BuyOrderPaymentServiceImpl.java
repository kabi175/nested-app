package com.nested.app.services;

import com.nested.app.client.mf.BuyOrderApiClient;
import com.nested.app.client.mf.PaymentsAPIClient;
import com.nested.app.client.mf.dto.OrderConsentRequest;
import com.nested.app.client.mf.dto.PaymentsOrder;
import com.nested.app.client.mf.dto.PaymentsRequest;
import com.nested.app.dto.PlaceOrderDTO;
import com.nested.app.dto.PlaceOrderPostDTO;
import com.nested.app.dto.UserActionRequest;
import com.nested.app.dto.VerifyOrderDTO;
import com.nested.app.entity.BuyOrder;
import com.nested.app.entity.Order;
import com.nested.app.entity.OrderItems;
import com.nested.app.repository.OrderRepository;
import com.nested.app.repository.PaymentRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Flux;

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

  @Value("${app.url}")
  private String APP_URL;

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
        return paymentServiceHelper.convertPaymentToPlaceOrderDTO(payment);
      }

      var confirmOrderRequests =
          buyOrderIds.stream()
              .map(
                  orderRef ->
                      OrderConsentRequest.builder()
                          .orderRef(orderRef)
                          .email(payment.getUser().getEmail())
                          .build())
              .toList();

      // Process confirmOrder requests in parallel with a batch size of 10
      Flux.fromIterable(confirmOrderRequests)
          .flatMap(buyOrderApiClient::updateConsent, 10) // Process 10 requests at a time
          .doOnNext(
              response ->
                  log.debug(
                      "Successfully confirmed order for payment ID: {}",
                      verifyOrderRequest.getId()))
          .doOnError(
              error ->
                  log.error(
                      "Error confirming order for payment ID: {}",
                      verifyOrderRequest.getId(),
                      error))
          .blockLast(); // Wait for all parallel requests to complete

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

      var orders = orderRepository.findByPaymentId(paymentID);

      var paymentMethod =
          payment.getPaymentType() == PlaceOrderPostDTO.PaymentMethod.UPI
              ? PaymentsRequest.PaymentMethod.UPI
              : PaymentsRequest.PaymentMethod.NET_BANKING;

      var paymentRequest =
          PaymentsRequest.builder()
              .bankId(payment.getBank().getPaymentRef())
              .paymentMethod(paymentMethod)
              .callback_url(callbackUrl(paymentID))
              .orders(
                  orders.stream()
                      .filter(BuyOrder.class::isInstance)
                      .map(Order::getItems)
                      .flatMap(List::stream)
                      .map(OrderItems::getPaymentRef)
                      .map(PaymentsOrder::new)
                      .toList())
              .build();

      var paymentResponse = paymentsAPIClient.createPayment(paymentRequest).block();
      if (paymentResponse == null) {
        throw new RuntimeException("Failed to initiate payment with MF provider");
      }

      payment.setPaymentUrl(paymentResponse.getRedirectUrl());
      payment.setRef(paymentResponse.getPaymentId());
      paymentRepository.save(payment);

      var buyOrderRefList =
          orders.stream()
              .filter(BuyOrder.class::isInstance)
              .map(Order::getItems)
              .flatMap(List::stream)
              .map(OrderItems::getRef)
              .toList();

      buyOrderApiClient.confirmOrder(buyOrderRefList).block();

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

  private String callbackUrl(Long paymentID) {
    return APP_URL + "/redirects/payment/" + paymentID;
  }
}
