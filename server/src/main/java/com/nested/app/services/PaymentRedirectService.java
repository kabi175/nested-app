package com.nested.app.services;

import com.nested.app.entity.Order;
import com.nested.app.entity.Payment;
import com.nested.app.entity.SIPOrder;
import com.nested.app.events.PaymentEvent;
import com.nested.app.repository.OrderRepository;
import com.nested.app.repository.PaymentRepository;
import java.time.LocalDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

/**
 * Service for handling payment redirect callbacks from payment gateway/mandate providers. Publishes
 * PaymentEvent for downstream listeners to verify and process.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentRedirectService {
  private final ApplicationEventPublisher publisher;
  private final PaymentRepository paymentRepository;
  private final OrderRepository orderRepository;

  /**
   * Handle mandate redirect from external provider. Publishes a PaymentEvent for the mandate
   * redirect.
   *
   * @param mandateId The mandate ID returned from the provider
   */
  public void handleMandateRedirect(Long mandateId) {
    log.info("Received mandate redirect for mandate ID: {}", mandateId);

    try {
      // Find orders with this mandate ID
      List<Order> orders =
          orderRepository.findAll().stream()
              .filter(
                  order ->
                      order instanceof SIPOrder
                          && ((SIPOrder) order).getMandateID() != null
                          && ((SIPOrder) order).getMandateID().equals(mandateId))
              .toList();

      if (orders.isEmpty()) {
        log.warn("No orders found for mandate ID: {}", mandateId);
        return;
      }

      Order firstOrder = orders.getFirst();
      Payment payment = firstOrder.getPayment();

      if (payment == null) {
        log.warn("No payment found for mandate ID: {}", mandateId);
        return;
      }

      // Publish mandate redirect event for async processing
      publisher.publishEvent(
          new PaymentEvent(payment.getRef(), Payment.PaymentStatus.SUBMITTED, LocalDateTime.now()));

      log.info(
          "Published mandate redirect event for Payment ID: {}, Mandate ID: {}",
          payment.getId(),
          mandateId);
    } catch (Exception e) {
      log.error("Error processing mandate redirect for mandate ID: {}", mandateId, e);
    }
  }

  /**
   * Handle payment redirect from external payment provider. Publishes a PaymentEvent for the
   * payment redirect.
   *
   * @param paymentRef The payment reference returned from the provider
   */
  public void handlePaymentRedirect(String paymentRef) {
    log.info("Received payment redirect for payment reference: {}", paymentRef);

    try {
      Payment payment = paymentRepository.findByRef(paymentRef).orElse(null);

      if (payment == null) {
        log.warn("Payment not found for reference: {}", paymentRef);
        return;
      }

      // Publish payment redirect event for async processing
      publisher.publishEvent(
          new PaymentEvent(payment.getRef(), Payment.PaymentStatus.COMPLETED, LocalDateTime.now()));

      log.info(
          "Published payment redirect event for Payment ID: {}, Ref: {}",
          payment.getId(),
          paymentRef);
    } catch (Exception e) {
      log.error("Error processing payment redirect for reference: {}", paymentRef, e);
    }
  }
}
