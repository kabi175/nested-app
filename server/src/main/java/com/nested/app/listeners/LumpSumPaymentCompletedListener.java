package com.nested.app.listeners;

import com.nested.app.client.mf.PaymentsAPIClient;
import com.nested.app.client.mf.dto.PaymentsResponse;
import com.nested.app.entity.BuyOrder;
import com.nested.app.entity.Goal;
import com.nested.app.entity.Order;
import com.nested.app.entity.OrderItems;
import com.nested.app.entity.Payment;
import com.nested.app.events.LumpSumPaymentCompletedEvent;
import com.nested.app.repository.OrderRepository;
import com.nested.app.repository.PaymentRepository;
import com.nested.app.repository.TenantAwareGoalRepository;
import com.nested.app.services.OrderSchedulerService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Event listener for buy order process events. Verifies payment status with external API client,
 * handles duplicate events idempotently, and updates payment/order statuses accordingly.
 *
 * <p>Workflow: 1. Receive LumpSumPaymentCompletedEvent 2. Verify actual payment status via
 * PaymentsAPIClient 3. Check current Payment buyStatus to detect duplicates (idempotency) 4. Update
 * Payment buyStatus, Order status, and Goal status only if verified
 *
 * @author Nested App Team
 * @version 2.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LumpSumPaymentCompletedListener {

  private final PaymentRepository paymentRepository;
  private final OrderRepository orderRepository;
  private final TenantAwareGoalRepository goalRepository;
  private final PaymentsAPIClient paymentsAPIClient;

  private final OrderSchedulerService orderSchedulerService;

  /**
   * Handles LumpSumPaymentCompletedEvent by verifying payment status with PaymentsAPIClient and
   * updating payment's buyStatus. Processes asynchronously after transaction commit to ensure data
   * consistency.
   *
   * @param event The LumpSumPaymentCompletedEvent containing payment reference
   */
  @EventListener
  public void on(LumpSumPaymentCompletedEvent event) {
    log.info("Processing LumpSumPaymentCompletedEvent for payment ref: {}", event.paymentRef());

    try {
      Payment payment = paymentRepository.findByRef(event.paymentRef()).orElseThrow();

      // Handle idempotency: check if already processed based on buyStatus
      if (isBuyOrderEventAlreadyProcessed(payment)) {
        log.debug(
            "LumpSumPaymentCompletedEvent already processed for payment ref: {}, current buyStatus: {}",
            event.paymentRef(),
            payment.getBuyStatus());
        return;
      }
      PaymentsResponse paymentResponse = paymentsAPIClient.fetchPayment(payment.getRef()).block();

      if (paymentResponse == null) {
        log.warn(
            "Payment fetch returned null for payment ref: {}, payment ID: {}",
            payment.getRef(),
            payment.getId());
        return;
      }

      // Verify payment status and update buyStatus
      handleSuccessPayment(payment, paymentResponse);

      log.info(
          "Successfully processed LumpSumPaymentCompletedEvent for payment ref: {}, new buyStatus: {}",
          event.paymentRef(),
          payment.getBuyStatus());
    } catch (Exception e) {
      log.error(
          "Error processing LumpSumPaymentCompletedEvent for payment ref: {}",
          event.paymentRef(),
          e);
    }
  }

  /**
   * Verify payment status and update payment buyStatus. Fetches payment details from API and
   * updates payment buyStatus if payment is successful.
   *
   * @param payment The payment entity to update
   */
  private void handleSuccessPayment(Payment payment, PaymentsResponse paymentResponse) {
    log.debug("Verifying payment status for payment ID: {}", payment.getId());

    try {
      // Verify payment is in success state
      if (isPaymentSuccessful(paymentResponse.getStatus())) {
        log.info(
            "Payment verified with status: {} for payment ref: {}, payment ID: {}",
            paymentResponse.getStatus(),
            payment.getRef(),
            payment.getId());

        // Update buyStatus to COMPLETED and mark as verified
        payment.setBuyStatus(Payment.PaymentStatus.COMPLETED);
        paymentRepository.save(payment);

        // Update all orders to COMPLETED status
        List<Order> orders =
            payment.getOrders().stream().filter(BuyOrder.class::isInstance).toList();

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
              if (order instanceof BuyOrder) {
                goal.setCurrentAmount(goal.getCurrentAmount() + order.getAmount());
              }
              goalRepository.save(goal);
            });

        orderSchedulerService.scheduleInstantOrderStatusJobs(
            orders.stream()
                .map(Order::getItems)
                .flatMap(List::stream)
                .map(OrderItems::getRef)
                .toList());

        log.info(
            "Updated payment ID: {} buyStatus to COMPLETED and {} orders to COMPLETED status",
            payment.getId(),
            orders.size());
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
   * Determine if payment response status indicates successful payment. Can be customized based on
   * actual API response values.
   *
   * @param status The status string from PaymentsResponse
   * @return true if payment is successful, false otherwise
   */
  private boolean isPaymentSuccessful(PaymentsResponse.Status status) {
    if (status == null) {
      return false;
    }
    // Customize based on actual API response values
    return PaymentsResponse.Status.SUCCESS == status;
  }
}
