package com.nested.app.listeners;

import com.nested.app.client.mf.MandateApiClient;
import com.nested.app.client.mf.PaymentsAPIClient;
import com.nested.app.client.mf.dto.MandateDto;
import com.nested.app.client.mf.dto.PaymentsResponse;
import com.nested.app.entity.Order;
import com.nested.app.entity.Payment;
import com.nested.app.events.PaymentEvent;
import com.nested.app.repository.OrderRepository;
import com.nested.app.repository.PaymentRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Event listener for PaymentEvent. Verifies payment status with external API clients, handles
 * duplicate events idempotently, and updates payment/order statuses accordingly.
 *
 * <p>Workflow: 1. Receive PaymentEvent from PaymentRedirectService 2. Verify actual status via
 * PaymentsAPIClient or MandateApiClient 3. Check current Payment status to detect duplicates
 * (idempotency) 4. Update Payment and Order statuses only if verified
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentRedirectEventListener {

  private final PaymentRepository paymentRepository;
  private final OrderRepository orderRepository;
  private final MandateApiClient mandateApiClient;
  private final PaymentsAPIClient paymentsAPIClient;

  /**
   * Handles PaymentEvent by verifying status with external APIs and updating payment state.
   * Processes asynchronously after transaction commit to ensure data consistency.
   *
   * @param event The PaymentEvent containing payment reference and expected status
   */
  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  @Async
  @Transactional
  public void handlePaymentEvent(PaymentEvent event) {
    log.info(
        "Processing PaymentEvent for payment ref: {}, status: {}", event.ref(), event.status());

    try {
      Payment payment = paymentRepository.findByRef(event.ref()).orElse(null);

      if (payment == null) {
        log.warn("Payment not found for reference: {}", event.ref());
        return;
      }

      // Handle idempotency: check if already processed
      if (isEventAlreadyProcessed(payment, event.status())) {
        log.debug(
            "PaymentEvent already processed for payment ref: {}, current status: {}",
            event.ref(),
            payment.getStatus());
        return;
      }

      // Verify status based on payment status type
      if (event.status() == Payment.PaymentStatus.SUBMITTED) {
        handleMandateVerification(payment);
      } else if (event.status() == Payment.PaymentStatus.COMPLETED) {
        handlePaymentVerification(payment);
      }

      log.info(
          "Successfully processed PaymentEvent for payment ref: {}, new status: {}",
          event.ref(),
          payment.getStatus());
    } catch (Exception e) {
      log.error(
          "Error processing PaymentEvent for payment ref: {}, status: {}",
          event.ref(),
          event.status(),
          e);
    }
  }

  /**
   * Handle mandate verification and status update. Fetches mandate details from API and updates
   * payment/orders if mandate is approved.
   *
   * @param payment The payment entity to update
   */
  private void handleMandateVerification(Payment payment) {
    log.debug("Verifying mandate status for payment ID: {}", payment.getId());

    // Get mandate ID from Payment
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
      if (mandate.getStatus() == MandateDto.State.APPROVED
          || mandate.getStatus() == MandateDto.State.SUBMITTED) {
        log.info(
            "Mandate verified with status: {} for mandate ID: {}, payment ID: {}",
            mandate.getStatus(),
            mandateId,
            payment.getId());

        updatePaymentAndOrdersToSubmitted(payment);
      } else {
        log.warn(
            "Mandate status not approved: {} for mandate ID: {}, payment ID: {}",
            mandate.getStatus(),
            mandateId,
            payment.getId());
      }
    } catch (Exception e) {
      log.error(
          "Error verifying mandate status for mandate ID: {}, payment ID: {}",
          mandateId,
          payment.getId(),
          e);
    }
  }

  /**
   * Handle payment verification and status update. Fetches payment details from API and updates
   * payment/orders if payment is successful.
   *
   * @param payment The payment entity to update
   */
  private void handlePaymentVerification(Payment payment) {
    log.debug("Verifying payment status for payment ID: {}", payment.getId());

    try {
      // Fetch actual payment status from API
      PaymentsResponse paymentResponse = paymentsAPIClient.fetchPayment(payment.getRef()).block();

      if (paymentResponse == null) {
        log.warn(
            "Payment fetch returned null for payment ref: {}, payment ID: {}",
            payment.getRef(),
            payment.getId());
        return;
      }

      // Verify payment is in success state (exact status value depends on API)
      if (isPaymentSuccessful(paymentResponse.getStatus())) {
        log.info(
            "Payment verified with status: {} for payment ref: {}, payment ID: {}",
            paymentResponse.getStatus(),
            payment.getRef(),
            payment.getId());

        updatePaymentAndOrdersToCompleted(payment);
      } else {
        log.warn(
            "Payment status not successful: {} for payment ref: {}, payment ID: {}",
            paymentResponse.getStatus(),
            payment.getRef(),
            payment.getId());
      }
    } catch (Exception e) {
      log.error(
          "Error verifying payment status for payment ref: {}, payment ID: {}",
          payment.getRef(),
          payment.getId(),
          e);
    }
  }

  /**
   * Update payment and all associated orders to SUBMITTED status.
   *
   * @param payment The payment to update
   */
  @Transactional
  private void updatePaymentAndOrdersToSubmitted(Payment payment) {
    payment.setStatus(Payment.PaymentStatus.SUBMITTED);
    paymentRepository.save(payment);

    // Update all orders to PLACED status
    List<Order> orders = payment.getOrders();
    if (orders != null) {
      for (Order order : orders) {
        order.setStatus(Order.OrderStatus.PLACED);
        orderRepository.save(order);
      }
    }

    log.info(
        "Updated payment ID: {} and {} orders to SUBMITTED/PLACED status",
        payment.getId(),
        orders != null ? orders.size() : 0);
  }

  /**
   * Update payment and all associated orders to COMPLETED status.
   *
   * @param payment The payment to update
   */
  @Transactional
  private void updatePaymentAndOrdersToCompleted(Payment payment) {
    payment.setStatus(Payment.PaymentStatus.COMPLETED);
    payment.setVerificationStatus(Payment.VerificationStatus.VERIFIED);
    paymentRepository.save(payment);

    // Update all orders to COMPLETED status
    List<Order> orders = payment.getOrders();
    if (orders != null) {
      for (Order order : orders) {
        order.setStatus(Order.OrderStatus.COMPLETED);
        orderRepository.save(order);
      }
    }

    log.info(
        "Updated payment ID: {} and {} orders to COMPLETED status",
        payment.getId(),
        orders != null ? orders.size() : 0);
  }

  /**
   * Check if event has already been processed by comparing current payment status with expected
   * target status. If payment is already at target status or beyond, consider it already processed
   * (idempotency).
   *
   * @param payment The payment entity
   * @param targetStatus The expected status from the event
   * @return true if already processed, false otherwise
   */
  private boolean isEventAlreadyProcessed(Payment payment, Payment.PaymentStatus targetStatus) {
    Payment.PaymentStatus currentStatus = payment.getStatus();

    // If target is SUBMITTED, already processed if current status is SUBMITTED or COMPLETED
    if (targetStatus == Payment.PaymentStatus.SUBMITTED) {
      return currentStatus == Payment.PaymentStatus.SUBMITTED
          || currentStatus == Payment.PaymentStatus.COMPLETED;
    }

    // If target is COMPLETED, already processed if current status is COMPLETED
    if (targetStatus == Payment.PaymentStatus.COMPLETED) {
      return currentStatus == Payment.PaymentStatus.COMPLETED;
    }

    return false;
  }

  /**
   * Determine if payment response status indicates successful payment. Can be customized based on
   * actual API response values.
   *
   * @param status The status string from PaymentsResponse
   * @return true if payment is successful, false otherwise
   */
  private boolean isPaymentSuccessful(String status) {
    if (status == null) {
      return false;
    }
    // Customize based on actual API response values
    return status.equalsIgnoreCase("success")
        || status.equalsIgnoreCase("completed")
        || status.equalsIgnoreCase("confirmed");
  }
}
