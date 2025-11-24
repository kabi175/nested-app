package com.nested.app.listeners;

import com.nested.app.client.mf.MandateApiClient;
import com.nested.app.client.mf.PaymentsAPIClient;
import com.nested.app.client.mf.dto.MandateDto;
import com.nested.app.client.mf.dto.PaymentsResponse;
import com.nested.app.entity.Goal;
import com.nested.app.entity.Order;
import com.nested.app.entity.Payment;
import com.nested.app.events.BuyOrderProcessEvent;
import com.nested.app.events.MandateProcessEvent;
import com.nested.app.repository.GoalRepository;
import com.nested.app.repository.OrderRepository;
import com.nested.app.repository.PaymentRepository;
import com.nested.app.services.SipOrderPaymentService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Event listener for payment redirect events. Verifies payment and mandate statuses with external
 * API clients, handles duplicate events idempotently, and updates payment/order statuses
 * accordingly.
 *
 * <p>Handles two event types:
 *
 * <ul>
 *   <li>MandateProcessEvent: Verifies mandate status via MandateApiClient, updates sipStatus
 *   <li>BuyOrderProcessEvent: Verifies payment status via PaymentsAPIClient, updates buyStatus
 * </ul>
 *
 * <p>Workflow: 1. Receive event from PaymentRedirectService 2. Verify actual status via external
 * API 3. Check current Payment status to detect duplicates (idempotency) 4. Update Payment and
 * Order statuses only if verified
 *
 * @author Nested App Team
 * @version 2.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentRedirectEventListener {

  private final PaymentRepository paymentRepository;
  private final OrderRepository orderRepository;
  private final GoalRepository goalRepository;
  private final MandateApiClient mandateApiClient;
  private final PaymentsAPIClient paymentsAPIClient;
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
      Payment payment = paymentRepository.findByMandateID(event.mandateId()).orElse(null);

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
   * Handles BuyOrderProcessEvent by verifying payment status with PaymentsAPIClient and updating
   * payment's buyStatus. Processes asynchronously after transaction commit to ensure data
   * consistency.
   *
   * @param event The BuyOrderProcessEvent containing payment reference
   */
  @EventListener
  public void handleBuyOrderProcessEvent(BuyOrderProcessEvent event) {
    log.info("Processing BuyOrderProcessEvent for payment ref: {}", event.paymentRef());

    try {
      Payment payment = paymentRepository.findByRef(event.paymentRef()).orElse(null);

      if (payment == null) {
        log.warn("Payment not found for reference: {}", event.paymentRef());
        return;
      }

      // Handle idempotency: check if already processed based on buyStatus
      if (isBuyOrderEventAlreadyProcessed(payment)) {
        log.debug(
            "BuyOrderProcessEvent already processed for payment ref: {}, current buyStatus: {}",
            event.paymentRef(),
            payment.getBuyStatus());
        return;
      }

      // Verify payment status and update buyStatus
      verifyAndUpdatePaymentStatus(payment);

      log.info(
          "Successfully processed BuyOrderProcessEvent for payment ref: {}, new buyStatus: {}",
          event.paymentRef(),
          payment.getBuyStatus());
    } catch (Exception e) {
      log.error("Error processing BuyOrderProcessEvent for payment ref: {}", event.paymentRef(), e);
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

        sipOrderPaymentService.placeSipOrders(payment.getId());

        log.info("sip orders placed for  payment ID: {} sipStatus to SUBMITTED", payment.getId());
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
   * Verify payment status and update payment buyStatus. Fetches payment details from API and
   * updates payment buyStatus if payment is successful.
   *
   * @param payment The payment entity to update
   */
  private void verifyAndUpdatePaymentStatus(Payment payment) {
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

      // Verify payment is in success state
      if (isPaymentSuccessful(paymentResponse.getStatus())) {
        log.info(
            "Payment verified with status: {} for payment ref: {}, payment ID: {}",
            paymentResponse.getStatus(),
            payment.getRef(),
            payment.getId());

        // Update buyStatus to COMPLETED and mark as verified
        payment.setBuyStatus(Payment.PaymentStatus.COMPLETED);
        payment.setVerificationStatus(Payment.VerificationStatus.VERIFIED);
        paymentRepository.save(payment);

        // Update all orders to COMPLETED status
        List<Order> orders = payment.getOrders();
        if (orders != null) {
          for (Order order : orders) {
            order.setStatus(Order.OrderStatus.COMPLETED);
            orderRepository.save(order);
          }
          orders.forEach(
              order -> {
                var goal = goalRepository.findById(order.getGoal().getId()).orElseThrow();
                if (goal.getStatus() == Goal.Status.PAYMENT_PENDING) {
                  goal.setStatus(Goal.Status.ACTIVE);
                }
                goal.setCurrentAmount(goal.getCurrentAmount() + order.getAmount());
                goalRepository.save(goal);
              });
        }

        log.info(
            "Updated payment ID: {} buyStatus to COMPLETED and {} orders to COMPLETED status",
            payment.getId(),
            orders != null ? orders.size() : 0);
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
   * Check if mandate event has already been processed by comparing current sipStatus. If sipStatus
   * is SUBMITTED or COMPLETED, consider it already processed (idempotency).
   *
   * @param payment The payment entity
   * @return true if already processed, false otherwise
   */
  private boolean isMandateEventAlreadyProcessed(Payment payment) {
    Payment.PaymentStatus currentSipStatus = payment.getSipStatus();

    // If sipStatus is already SUBMITTED or COMPLETED, consider it processed
    return currentSipStatus != Payment.PaymentStatus.PENDING;
  }

  /**
   * Check if buy order event has already been processed by comparing current buyStatus. If
   * buyStatus is COMPLETED, consider it already processed (idempotency).
   *
   * @param payment The payment entity
   * @return true if already processed, false otherwise
   */
  private boolean isBuyOrderEventAlreadyProcessed(Payment payment) {
    Payment.PaymentStatus currentBuyStatus = payment.getBuyStatus();

    // If buyStatus is already COMPLETED, consider it processed
    return currentBuyStatus == Payment.PaymentStatus.COMPLETED;
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
    Payment.PaymentStatus currentStatus = payment.getBuyStatus();

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
