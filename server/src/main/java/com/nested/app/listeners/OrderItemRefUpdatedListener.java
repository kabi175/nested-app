package com.nested.app.listeners;

import com.nested.app.events.OrderItemRefUpdatedEvent;
import com.nested.app.events.OrderItemsRefUpdatedEvent;
import com.nested.app.services.OrderSchedulerService;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Listener that handles OrderItemRefUpdatedEvent events. When an order item's ref is updated, this
 * listener schedules an order status check job.
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderItemRefUpdatedListener {

  private final OrderSchedulerService orderSchedulerService;

  /**
   * Handles the OrderItemRefUpdatedEvent by scheduling an order status check job. This listener is
   * triggered after the transaction commits to ensure data consistency.
   *
   * @param event The event containing order item details
   * @deprecated Use batched event handler instead for better performance
   */
  @Deprecated
  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  @Async
  public void handleOrderItemRefUpdated(OrderItemRefUpdatedEvent event) {
    log.info(
        "Received OrderItemRefUpdatedEvent for Order ID: {}, OrderItem ID: {}, Ref: {}",
        event.getOrderId(),
        event.getOrderItemId(),
        event.getRef());

    try {
      orderSchedulerService.scheduleOrderStatusJob(event.getOrderId().toString());
      log.info(
          "Successfully scheduled status check job for Order ID: {} (triggered by OrderItem ID: {})",
          event.getOrderId(),
          event.getOrderItemId());
    } catch (Exception e) {
      log.error(
          "Failed to schedule status check job for Order ID: {} (OrderItem ID: {})",
          event.getOrderId(),
          event.getOrderItemId(),
          e);
    }
  }

  /**
   * Handles the batched OrderItemsRefUpdatedEvent by scheduling multiple order status check jobs.
   * This is more efficient than handling individual events. This listener is triggered after the
   * transaction commits to ensure data consistency.
   *
   * @param event The batched event containing multiple order item details
   */
  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  @Async
  public void handleOrderItemsRefUpdated(OrderItemsRefUpdatedEvent event) {
    log.info(
        "Received OrderItemsRefUpdatedEvent for Payment ID: {} with {} order items",
        event.getPaymentId(),
        event.getOrderItems().size());

    try {
      // Extract unique order IDs from the batch
      List<String> orderIds =
          event.getOrderItems().stream()
              .map(OrderItemsRefUpdatedEvent.OrderItemRefInfo::getOrderId)
              .distinct()
              .map(String::valueOf)
              .collect(Collectors.toList());

      log.debug("Scheduling jobs for {} unique orders", orderIds.size());

      orderSchedulerService.scheduleOrderStatusJobs(orderIds);

      log.info(
          "Successfully scheduled {} status check jobs in batch for Payment ID: {}",
          orderIds.size(),
          event.getPaymentId());
    } catch (Exception e) {
      log.error(
          "Failed to schedule status check jobs in batch for Payment ID: {}",
          event.getPaymentId(),
          e);
    }
  }
}
