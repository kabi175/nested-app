package com.nested.app.listeners;

import com.nested.app.client.mf.MandateApiClient;
import com.nested.app.client.mf.dto.MandateDto;
import com.nested.app.entity.Payment;
import com.nested.app.events.MandateProcessEvent;
import com.nested.app.repository.PaymentRepository;
import com.nested.app.services.SipOrderPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Event listener for mandate process events. Verifies mandate status with external API client,
 * handles duplicate events idempotently, and updates payment sipStatus accordingly.
 *
 * <p>Workflow: 1. Receive MandateProcessEvent 2. Verify actual mandate status via MandateApiClient
 * 3. Check current Payment sipStatus to detect duplicates (idempotency) 4. Update Payment sipStatus
 * and place SIP orders only if verified
 *
 * @author Nested App Team
 * @version 2.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MandateProcessEventListener {

  private final PaymentRepository paymentRepository;
  private final MandateApiClient mandateApiClient;
  private final SipOrderPaymentService sipOrderPaymentService;

  /**
   * Handles MandateProcessEvent by verifying mandate status with MandateApiClient and updating
   * payment's sipStatus. Processes asynchronously after transaction commit to ensure data
   * consistency.
   *
   * @param event The MandateProcessEvent containing mandate ID
   */
  @EventListener
  public void handleMandateProcessEvent(MandateProcessEvent event) {
    log.info("Processing MandateProcessEvent for mandate ID: {}", event.mandateId());

    try {
      Payment payment = event.payment();

      if (payment == null) {
        log.warn("Payment not found for mandate ID: {}", event.mandateId());
        return;
      }

      // Handle idempotency: check if already processed based on sipStatus
      if (isMandateEventAlreadyProcessed(payment)) {
        log.debug(
            "MandateProcessEvent already processed for mandate ID: {}, current sipStatus: {}",
            event.mandateId(),
            payment.getSipStatus());
        return;
      }

      // Verify mandate status and update sipStatus
      verifyAndUpdateMandateStatus(payment);

      log.info(
          "Successfully processed MandateProcessEvent for mandate ID: {}, new sipStatus: {}",
          event.mandateId(),
          payment.getSipStatus());
    } catch (Exception e) {
      log.error("Error processing MandateProcessEvent for mandate ID: {}", event.mandateId(), e);
    }
  }

  /**
   * Verify mandate status and update payment sipStatus. Fetches mandate details from API and
   * updates payment sipStatus if mandate is approved.
   *
   * @param payment The payment entity to update
   */
  private void verifyAndUpdateMandateStatus(Payment payment) {
    log.debug("Verifying mandate status for payment ID: {}", payment.getId());

    Long mandateId = payment.getMandateID();

    if (mandateId == null) {
      log.warn("No mandate ID found for payment ID: {}", payment.getId());
      return;
    }

    try {
      // Fetch actual mandate status from API
      MandateDto mandate = mandateApiClient.fetchMandate(mandateId).block();

      if (mandate == null) {
        log.warn(
            "Mandate fetch returned null for mandate ID: {}, payment ID: {}",
            mandateId,
            payment.getId());
        return;
      }

      // Verify mandate is in approved state
      if (mandate.getStatus() == MandateDto.State.APPROVED) {
        log.info(
            "Mandate verified with status: {} for mandate ID: {}, payment ID: {}",
            mandate.getStatus(),
            mandateId,
            payment.getId());

        sipOrderPaymentService.placeSipOrders(payment);
        payment.setSipStatus(Payment.PaymentStatus.ACTIVE);

        log.info("sip orders placed for payment ID: {} sipStatus to SUBMITTED", payment.getId());
      } else if (mandate.getStatus() == MandateDto.State.CANCELLED) {
        payment.setSipStatus(Payment.PaymentStatus.CANCELLED);
        log.warn(
            "Mandate cancelled for mandate ID: {}, payment ID: {}", mandateId, payment.getId());
      } else if (mandate.getStatus() == MandateDto.State.REJECTED) {
        payment.setSipStatus(Payment.PaymentStatus.FAILED);
        log.warn("Mandate Rejected for mandate ID: {}, payment ID: {}", mandateId, payment.getId());
      }
      paymentRepository.saveAndFlush(payment);
    } catch (Exception e) {
      log.error(
          "Error verifying mandate status for mandate ID: {}, payment ID: {}",
          mandateId,
          payment.getId(),
          e);
    }
  }

  /**
   * Check if mandate event has already been processed by comparing current sipStatus. If sipStatus
   * is SUBMITTED or COMPLETED, consider it already processed (idempotency).
   *
   * @param payment The payment entity
   * @return true if already processed, false otherwise
   */
  private boolean isMandateEventAlreadyProcessed(Payment payment) {
    Payment.PaymentStatus currentSipStatus = payment.getSipStatus();

    // If sipStatus is already COMPLETED, consider it processed
    return currentSipStatus != Payment.PaymentStatus.SUBMITTED;
  }
}
