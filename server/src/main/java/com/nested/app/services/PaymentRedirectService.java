package com.nested.app.services;

import com.nested.app.entity.Payment;
import com.nested.app.events.LumpSumPaymentCompletedEvent;
import com.nested.app.events.MandateProcessEvent;
import com.nested.app.repository.PaymentRepository;
import com.nested.app.utils.MobileRedirectHandler;
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
  private final MobileRedirectHandler mobileRedirectHandler;

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
      Payment payment = paymentRepository.findByMandateID(mandateId).orElseThrow();

      // Publish mandate process event for async processing and verification
      publisher.publishEvent(new MandateProcessEvent(mandateId, payment, LocalDateTime.now()));

      log.info(
          "Published mandate process event for Payment ID: {}, Mandate ID: {}",
          payment.getId(),
          mandateId);

      if (payment.getSipStatus().equals(Payment.PaymentStatus.ACTIVE)) {
        return mobileRedirectHandler.redirectUrl(
            "payment/" + payment.getId() + "/success?type=sip");
      }

      return mobileRedirectHandler.redirectUrl("payment/" + payment.getId() + "/failure?type=sip");
    } catch (Exception e) {
      log.error("Error processing mandate redirect for mandate ID: {}", mandateId, e);
      throw new RuntimeException();
    }
  }

  /**
   * Handle payment redirect from external payment provider. Publishes a
   * LumpSumPaymentCompletedEvent for the payment redirect to verify and process async.
   *
   * @param paymentID The internal payment id
   */
  public String handlePaymentRedirect(Long paymentID) {
    log.info("Received payment redirect for payment id: {}", paymentID);

    try {
      Payment payment = paymentRepository.findById(paymentID).orElseThrow();


      var paymentRef = payment.getRef();
      // Publish buy order process event for async processing and verification
      publisher.publishEvent(new LumpSumPaymentCompletedEvent(paymentRef, LocalDateTime.now()));
      log.info(
          "Published buy order process event for Payment ID: {}, Ref: {}",
          payment.getId(),
          paymentRef);

      payment = paymentRepository.findById(paymentID).orElseThrow();
      return switch (payment.getBuyStatus()) {
        case COMPLETED ->
            mobileRedirectHandler.redirectUrl("payment/" + paymentID + "/success?type=buy");
        case CANCELLED ->
            mobileRedirectHandler.redirectUrl("payment/" + paymentID + "/failure?type=buy");
        default -> mobileRedirectHandler.redirectUrl("payment/" + paymentID + "/processing");
      };

    } catch (Exception e) {
      log.error("Error processing payment redirect for payment id: {}", paymentID, e);
      return mobileRedirectHandler.redirectUrl("payment/" + paymentID + "/failure?type=buy");
    }
  }
}
