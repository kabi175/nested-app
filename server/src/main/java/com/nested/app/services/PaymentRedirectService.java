package com.nested.app.services;

import com.nested.app.entity.Payment;
import com.nested.app.events.BuyOrderProcessEvent;
import com.nested.app.events.MandateProcessEvent;
import com.nested.app.repository.PaymentRepository;
import java.time.LocalDateTime;
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

  /**
   * Handle mandate redirect from external provider. Publishes a MandateProcessEvent for the mandate
   * redirect to verify and process async.
   *
   * @param mandateId The mandate ID returned from the provider
   */
  public void handleMandateRedirect(Long mandateId) {
    log.info("Received mandate redirect for mandate ID: {}", mandateId);

    try {
      // Find payment with this mandate ID
      Payment payment = paymentRepository.findByMandateID(mandateId).orElse(null);

      if (payment == null) {
        log.warn("No payment found for mandate ID: {}", mandateId);
        return;
      }

      // Publish mandate process event for async processing and verification
      publisher.publishEvent(new MandateProcessEvent(mandateId, LocalDateTime.now()));

      log.info(
          "Published mandate process event for Payment ID: {}, Mandate ID: {}",
          payment.getId(),
          mandateId);
    } catch (Exception e) {
      log.error("Error processing mandate redirect for mandate ID: {}", mandateId, e);
    }
  }

  /**
   * Handle payment redirect from external payment provider. Publishes a BuyOrderProcessEvent for
   * the payment redirect to verify and process async.
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

      // Publish buy order process event for async processing and verification
      publisher.publishEvent(new BuyOrderProcessEvent(paymentRef, LocalDateTime.now()));

      log.info(
          "Published buy order process event for Payment ID: {}, Ref: {}",
          payment.getId(),
          paymentRef);
    } catch (Exception e) {
      log.error("Error processing payment redirect for reference: {}", paymentRef, e);
    }
  }
}
