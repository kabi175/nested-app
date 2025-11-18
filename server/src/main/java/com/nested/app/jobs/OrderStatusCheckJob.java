package com.nested.app.jobs;

import com.nested.app.client.mf.BuyOrderApiClient;
import com.nested.app.client.mf.dto.OrderData;
import com.nested.app.entity.OrderItems;
import com.nested.app.repository.OrderItemsRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class OrderStatusCheckJob implements Job {

  private static final int DECIMAL_SCALE = 4;
  private static final int CALCULATION_SCALE = 8;

  @Autowired private BuyOrderApiClient buyOrderAPIClient;
  @Autowired private OrderItemsRepository orderItemsRepository;
  @Autowired private Scheduler scheduler;

  @Override
  public void execute(JobExecutionContext context) throws JobExecutionException {
    JobDataMap data = context.getMergedJobDataMap();
    String orderId = data.getString("orderId");

    var order = buyOrderAPIClient.fetchOrderDetails(orderId).block();
    if (order == null) {
      log.error("MF BuyOrder not found for id: {}", orderId);
      return;
    }

    if (OrderData.OrderState.SUCCESSFUL.equals(order.getState())) {
      processSuccessfulOrder(orderId, order);
    }

    if (isOrderInTerminalState(order.getState())) {
      deleteJob(context);
    }
  }

  private void processSuccessfulOrder(String orderId, OrderData order) {
    var orderItems = orderItemsRepository.findByRef(orderId);

    if (orderItems.isEmpty()) {
      log.warn("No order items found for successful order id: {}", orderId);
      return;
    }

    updateOrderItemsWithOrderData(orderItems, order, orderId);
    orderItemsRepository.saveAll(orderItems);
    log.info("Updated {} order items (units & price) for orderId: {}", orderItems.size(), orderId);
  }

  private void updateOrderItemsWithOrderData(
      List<OrderItems> orderItems, OrderData order, String orderId) {
    distributeUnits(orderItems, order.getAllottedUnits(), orderId);
    updateUnitPrice(orderItems, order.getPurchasedPrice(), orderId);
  }

  private void distributeUnits(
      List<OrderItems> orderItems, Double totalAllottedUnits, String orderId) {
    if (totalAllottedUnits == null || totalAllottedUnits <= 0) {
      log.warn(
          "Allotted units missing or zero for orderId {}. Skipping units distribution.", orderId);
      return;
    }

    double totalAmount = calculateTotalAmount(orderItems);
    BigDecimal totalUnitsBD = BigDecimal.valueOf(totalAllottedUnits);

    if (totalAmount <= 0) {
      distributeUnitsEqually(orderItems, totalUnitsBD);
    } else {
      distributeUnitsProportionally(orderItems, totalUnitsBD, totalAmount);
    }
  }

  private double calculateTotalAmount(List<OrderItems> orderItems) {
    return orderItems.stream().mapToDouble(i -> i.getAmount() != 0 ? i.getAmount() : 0).sum();
  }

  protected void distributeUnitsEqually(List<OrderItems> orderItems, BigDecimal totalUnits) {
    BigDecimal distributed = BigDecimal.ZERO;
    int size = orderItems.size();

    for (int idx = 0; idx < size; idx++) {
      var item = orderItems.get(idx);
      BigDecimal unitsForItem;

      if (idx == size - 1) {
        // Last item gets the remainder to ensure total matches exactly
        unitsForItem = totalUnits.subtract(distributed);
      } else {
        // Calculate equal share for this item
        BigDecimal remaining = totalUnits.subtract(distributed);
        int itemsLeft = size - idx;
        unitsForItem =
            remaining.divide(
                BigDecimal.valueOf(itemsLeft), CALCULATION_SCALE, RoundingMode.HALF_UP);
        distributed = distributed.add(unitsForItem);
      }

      item.setUnits(unitsForItem.setScale(DECIMAL_SCALE, RoundingMode.HALF_UP).doubleValue());
    }
  }

  protected void distributeUnitsProportionally(
      List<OrderItems> orderItems, BigDecimal totalUnits, double totalAmount) {
    BigDecimal distributed = BigDecimal.ZERO;
    BigDecimal totalAmountBD = BigDecimal.valueOf(totalAmount);

    for (int idx = 0; idx < orderItems.size(); idx++) {
      var item = orderItems.get(idx);
      double amount = item.getAmount() != 0 ? item.getAmount() : 0;
      BigDecimal unitsForItem;

      if (idx == orderItems.size() - 1) {
        // Assign remainder to last item to fix rounding drift
        unitsForItem = totalUnits.subtract(distributed);
      } else {
        unitsForItem =
            totalUnits
                .multiply(BigDecimal.valueOf(amount))
                .divide(totalAmountBD, CALCULATION_SCALE, RoundingMode.HALF_UP);
        distributed = distributed.add(unitsForItem);
      }

      item.setUnits(unitsForItem.setScale(DECIMAL_SCALE, RoundingMode.HALF_UP).doubleValue());
    }
  }

  private void updateUnitPrice(List<OrderItems> orderItems, Double purchasedPrice, String orderId) {
    if (purchasedPrice == null || purchasedPrice <= 0) {
      log.warn(
          "Purchased price missing or invalid for orderId {}. unitPrice will not be updated.",
          orderId);
      return;
    }

    orderItems.forEach(item -> item.setUnitPrice(purchasedPrice));
  }

  private boolean isOrderInTerminalState(OrderData.OrderState state) {
    return List.of(OrderData.OrderState.FAILED, OrderData.OrderState.SUCCESSFUL).contains(state);
  }

  private void deleteJob(JobExecutionContext context) throws JobExecutionException {
    try {
      scheduler.deleteJob(context.getJobDetail().getKey());
      log.info("Order completed. Job deleted!");
    } catch (SchedulerException e) {
      throw new JobExecutionException(e);
    }
  }
}
