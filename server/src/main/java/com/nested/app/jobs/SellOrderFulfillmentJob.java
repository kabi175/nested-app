package com.nested.app.jobs;

import com.nested.app.client.mf.SellOrderApiClient;
import com.nested.app.client.mf.dto.OrderData;
import com.nested.app.entity.Folio;
import com.nested.app.entity.OrderItems;
import com.nested.app.entity.Transaction;
import com.nested.app.enums.TransactionType;
import com.nested.app.events.GoalSyncEvent;
import com.nested.app.events.TransactionSuccessEvent;
import com.nested.app.repository.FolioRepository;
import com.nested.app.repository.OrderItemsRepository;
import com.nested.app.repository.TransactionRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Quartz job that periodically checks the status of an external SELL order and, upon success,
 * records negative units to reflect redemption. Similar to BuyOrderFulfillmentJob but handles
 * sell-specific logic with negative units for disposals.
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Component
@DisallowConcurrentExecution
@RequiredArgsConstructor
public class SellOrderFulfillmentJob implements Job {

  private static final int DECIMAL_SCALE = 4;
  private static final int CALCULATION_SCALE = 8;

  private final SellOrderApiClient sellOrderApiClient;
  private final OrderItemsRepository orderItemsRepository;
  private final Scheduler scheduler;
  private final TransactionRepository transactionRepository;
  private final FolioRepository folioRepository;
  private final ApplicationEventPublisher publisher;

  @Override
  public void execute(JobExecutionContext context) throws JobExecutionException {
    JobDataMap data = context.getMergedJobDataMap();
    String orderRef = data.getString("orderRef");

    var order = sellOrderApiClient.fetchOrderDetails(orderRef).block();
    if (order == null) {
      log.error("MF SellOrder not found for ref: {}", orderRef);
      return;
    }

    if (OrderData.OrderState.SUCCESSFUL.equals(order.getState())) {
      processSuccessfulOrder(orderRef, order);
    }

    if (isOrderInTerminalState(order.getState())) {
      deleteJob(context);
    }
  }

  private void processSuccessfulOrder(String orderRef, OrderData order) {
    var orderItems = orderItemsRepository.findByRef(orderRef);

    if (orderItems.isEmpty()) {
      log.warn("No order items found for successful sell order ref: {}", orderRef);
      return;
    }

    // Guard: if all items already populated with units & unitPrice, skip recalculation
    boolean alreadyPopulated =
        orderItems.stream()
            .allMatch(
                i ->
                    i.getUnits() != null
                        && i.getUnits() != 0
                        && i.getUnitPrice() != null
                        && i.getUnitPrice() > 0);
    if (!alreadyPopulated) {
      updateOrderItemsWithOrderData(orderItems, order, orderRef);
      orderItemsRepository.saveAll(orderItems);
      log.info(
          "Updated {} order items (units & price) for sell order ref: {}",
          orderItems.size(),
          orderRef);
    } else {
      log.debug("Order items already populated for sell order ref {} - skipping update", orderRef);
    }
    createTransactionsForOrderItems(orderItems, order);
  }

  private void updateOrderItemsWithOrderData(
      List<OrderItems> orderItems, OrderData order, String orderRef) {
    distributeUnits(orderItems, order.getAllottedUnits(), orderRef);
    updateUnitPrice(orderItems, order.getPurchasedPrice(), orderRef);
  }

  /**
   * For SELL orders, units should be negative to represent disposal. We distribute the allotted
   * units as negative values.
   */
  private void distributeUnits(
      List<OrderItems> orderItems, Double totalAllottedUnits, String orderRef) {
    if (totalAllottedUnits == null || totalAllottedUnits <= 0) {
      log.warn(
          "Allotted units missing or zero for sell order ref {}. Skipping units distribution.",
          orderRef);
      return;
    }

    // For sell orders, units should be negative
    double totalAmount = calculateTotalAmount(orderItems);
    BigDecimal totalUnitsBD = BigDecimal.valueOf(-Math.abs(totalAllottedUnits)); // Ensure negative

    if (totalAmount <= 0) {
      distributeUnitsEqually(orderItems, totalUnitsBD);
    } else {
      distributeUnitsProportionally(orderItems, totalUnitsBD, totalAmount);
    }
  }

  private double calculateTotalAmount(List<OrderItems> orderItems) {
    return orderItems.stream().mapToDouble(i -> i.getAmount() != 0 ? i.getAmount() : 0).sum();
  }

  /**
   * Split total units evenly; last item absorbs any rounding drift ensuring exact sum conservation.
   */
  protected void distributeUnitsEqually(List<OrderItems> orderItems, BigDecimal totalUnits) {
    BigDecimal sizeBD = BigDecimal.valueOf(orderItems.size());
    BigDecimal baseShareRaw = totalUnits.divide(sizeBD, CALCULATION_SCALE, RoundingMode.HALF_UP);
    BigDecimal distributed = BigDecimal.ZERO;
    for (int idx = 0; idx < orderItems.size(); idx++) {
      BigDecimal unitsForItem;
      if (idx == orderItems.size() - 1) {
        unitsForItem = totalUnits.subtract(distributed); // exact remainder
      } else {
        unitsForItem = baseShareRaw.setScale(DECIMAL_SCALE, RoundingMode.HALF_UP);
        distributed = distributed.add(unitsForItem);
      }
      orderItems.get(idx).setUnits(unitsForItem.doubleValue());
    }
  }

  /**
   * Allocate units proportional to monetary amount per item; last item receives remainder to handle
   * rounding.
   */
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

  private void updateUnitPrice(
      List<OrderItems> orderItems, Double purchasedPrice, String orderRef) {
    if (purchasedPrice == null || purchasedPrice <= 0) {
      log.warn(
          "Purchased price missing or invalid for sell order ref {}. unitPrice will not be updated.",
          orderRef);
      return;
    }

    orderItems.forEach(item -> item.setUnitPrice(purchasedPrice));
  }

  private void createTransactionsForOrderItems(List<OrderItems> orderItems, OrderData order) {
    // Idempotent transaction creation: skip if repository missing (test context) or already exists.
    if (transactionRepository == null) { // test context may not inject
      return;
    }

    // Create or retrieve Folio entity using folioRef from OrderData
    Folio folio = null;
    if (order.getFolioRef() != null && !order.getFolioRef().isEmpty() && folioRepository != null) {
      folio = getOrCreateFolio(order.getFolioRef(), orderItems);
    }

    int created = 0;
    for (var item : orderItems) {
      if (item.getUnits() == null || item.getUnitPrice() == null) {
        continue; // incomplete item
      }
      if (transactionRepository.existsBySourceOrderItemId(item.getId())) {
        continue; // idempotent skip
      }
      var txn = new Transaction();
      txn.setUser(item.getUser());
      txn.setGoal(item.getOrder() != null ? item.getOrder().getGoal() : null);
      txn.setFund(item.getFund());
      txn.setFolio(folio); // associate with folio
      txn.setType(TransactionType.SELL); // SELL transaction
      txn.setUnits(item.getUnits()); // Should be negative from distributeUnits
      txn.setUnitPrice(item.getUnitPrice());
      txn.setAmount(Math.abs(item.getUnits() * item.getUnitPrice())); // Absolute value for amount
      txn.setExternalRef(item.getRef());
      txn.setSourceOrderItemId(item.getId());
      txn.setExecutedAt(Timestamp.from(Instant.now()));
      transactionRepository.save(txn);

      if (txn.getGoal() != null) {
        publisher.publishEvent(new GoalSyncEvent(txn.getGoal().getId(), txn.getUser()));
      } else {
        log.warn("goal not populated for transaction {}", txn.getId());
      }
      // Send transaction success email notification
      publisher.publishEvent(
          new TransactionSuccessEvent(
              txn.getUser(),
              txn.getFund() != null ? txn.getFund().getName() : null,
              txn.getAmount(),
              txn.getType()));
      created++;
    }
    if (created > 0) {
      log.info("Created {} SELL transaction(s) from order items", created);
    }
  }

  /** Retrieves an existing Folio by reference or creates a new one if not found. */
  private Folio getOrCreateFolio(String folioRef, List<OrderItems> orderItems) {
    return folioRepository
        .findByRef(folioRef)
        .orElseGet(
            () -> {
              if (orderItems.isEmpty()) {
                log.warn("Cannot create folio {} - no order items available", folioRef);
                return null;
              }

              var firstItem = orderItems.getFirst();
              var newFolio = new Folio();
              newFolio.setRef(folioRef);
              newFolio.setUser(firstItem.getUser());
              newFolio.setFund(firstItem.getFund());
              // Set investor if available from user relationship
              if (firstItem.getUser() != null && firstItem.getUser().getInvestor() != null) {
                newFolio.setInvestor(firstItem.getUser().getInvestor());
              }

              Folio savedFolio = folioRepository.save(newFolio);
              log.info(
                  "Created new Folio with ref: {} for user: {} and fund: {}",
                  folioRef,
                  firstItem.getUser().getId(),
                  firstItem.getFund().getId());
              return savedFolio;
            });
  }

  private boolean isOrderInTerminalState(OrderData.OrderState state) {
    return state == OrderData.OrderState.SUCCESSFUL
        || state == OrderData.OrderState.FAILED
        || state == OrderData.OrderState.CANCELLED;
  }

  private void deleteJob(JobExecutionContext context) {
    try {
      scheduler.deleteJob(context.getJobDetail().getKey());
      log.info("Deleted job: {}", context.getJobDetail().getKey());
    } catch (SchedulerException e) {
      log.error("Failed to delete job: {}", context.getJobDetail().getKey(), e);
    }
  }
}
