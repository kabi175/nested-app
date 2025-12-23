package com.nested.app.listeners;

import com.nested.app.dto.OrderDTO;
import com.nested.app.events.OrderItemsRefUpdatedEvent;
import com.nested.app.services.OrderSchedulerService;
import com.nested.app.services.SchemeWiseReportService;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Listener that handles OrderItemsRefUpdatedEvent events. When an order item's ref is updated, this
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

  private final SchemeWiseReportService schemeWiseReportService;

  /**
   * Handles the batched OrderItemsRefUpdatedEvent by scheduling multiple order status check jobs.
   * This is more efficient than handling individual events. This listener is triggered after the
   * transaction commits to ensure data consistency.
   *
   * @param event The batched event containing multiple order item details
   */
  @Async
  @EventListener
  public void handleOrderItemsRefUpdated(OrderItemsRefUpdatedEvent event) {
    log.info(
        "Received OrderItemsRefUpdatedEvent for Payment ID: {} with {} order items",
        event.getPaymentId(),
        event.getOrderItems().size());

    try {
      // Extract unique order IDs from the batch
      List<String> orderIds =
          event.getOrderItems().stream()
              .filter(orderItemRefInfo -> orderItemRefInfo.orderType() == OrderDTO.OrderType.BUY)
              .map(OrderItemsRefUpdatedEvent.OrderItemRefInfo::ref)
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

    schemeWiseReportService.fetchReportsForAllInvestors();
  }
}
