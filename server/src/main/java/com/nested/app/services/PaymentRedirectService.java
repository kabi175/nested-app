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
  public String handleMandateRedirect(Long mandateId) {
    log.info("Received mandate redirect for mandate ID: {}", mandateId);

    try {
      // Find payment with this mandate ID

      // Publish mandate process event for async processing and verification
      publisher.publishEvent(new MandateProcessEvent(mandateId, LocalDateTime.now()));
      Payment payment = paymentRepository.findByMandateID(mandateId).orElse(null);

      if (payment == null) {
        log.warn("No payment found for mandate ID: {}", mandateId);
        throw new RuntimeException();
      }

      log.info(
          "Published mandate process event for Payment ID: {}, Mandate ID: {}",
          payment.getId(),
          mandateId);

      if (payment.getSipStatus().equals(Payment.PaymentStatus.ACTIVE)) {
        return "redirect:exp+nested://payment/" + payment.getId() + "/success?type=sip";
      }

      return "redirect:exp+nested://payment/" + payment.getId() + "/failure?type=sip";
    } catch (Exception e) {
      log.error("Error processing mandate redirect for mandate ID: {}", mandateId, e);
      throw new RuntimeException();
    }
  }

  /**
   * Handle payment redirect from external payment provider. Publishes a BuyOrderProcessEvent for
   * the payment redirect to verify and process async.
   *
   * @param paymentID The internal payment id
   */
  public void handlePaymentRedirect(Long paymentID) {
    log.info("Received payment redirect for payment id: {}", paymentID);

    try {
      Payment payment = paymentRepository.findById(paymentID).orElseThrow();

      var paymentRef = payment.getRef();
      // Publish buy order process event for async processing and verification
      publisher.publishEvent(new BuyOrderProcessEvent(paymentRef, LocalDateTime.now()));

      log.info(
          "Published buy order process event for Payment ID: {}, Ref: {}",
          payment.getId(),
          paymentRef);
    } catch (Exception e) {
      log.error("Error processing payment redirect for payment id: {}", paymentID, e);
      throw new RuntimeException();
    }
  }
}
