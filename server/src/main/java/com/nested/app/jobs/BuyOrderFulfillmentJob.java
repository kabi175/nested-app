package com.nested.app.jobs;

import com.nested.app.client.mf.BuyOrderApiClient;
import com.nested.app.client.mf.dto.OrderData;
import com.nested.app.entity.Folio;
import com.nested.app.entity.OrderItems;
import com.nested.app.entity.Transaction;
import com.nested.app.enums.TransactionType;
import com.nested.app.events.GoalSyncEvent;
import com.nested.app.events.TransactionSuccessEvent;
import com.nested.app.mapper.OrderStateMapper;
import com.nested.app.repository.FolioRepository;
import com.nested.app.repository.OrderItemsRepository;
import com.nested.app.repository.TransactionRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
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
 * Quartz job that periodically checks the status of an external BUY order and, upon success,
 * distributes allotted units and records Transaction entries. It ensures: - Idempotent unit/price
 * population (skips if already set) - Precise unit distribution (equal or proportional) with
 * rounding remainder adjustment - Safe transaction creation guarded by duplicate checks
 * (sourceOrderItemId)
 */
@Slf4j
@Component
@RequiredArgsConstructor
@DisallowConcurrentExecution
public class BuyOrderFulfillmentJob implements Job {

  private static final int DECIMAL_SCALE = 4;
  private static final int CALCULATION_SCALE = 8;

  private final BuyOrderApiClient buyOrderAPIClient;
  private final OrderItemsRepository orderItemsRepository;
  private final Scheduler scheduler;
  private final TransactionRepository transactionRepository;
  private final FolioRepository folioRepository;
  private final ApplicationEventPublisher publisher;

  @Override
  public void execute(JobExecutionContext context) throws JobExecutionException {
    JobDataMap data = context.getMergedJobDataMap();
    String orderId = data.getString("orderId");
    log.info("BuyOrderFulfillmentJob start order_id{}", orderId);

    var order = buyOrderAPIClient.fetchOrderDetails(orderId).block();
    if (order == null) {
      log.error("MF BuyOrder not found for id: {}", orderId);
      return;
    }

    processSuccessfulOrder(orderId, order);

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

    // guard: if all items already populated with units & unitPrice, skip recalculation
    boolean alreadyPopulated =
        orderItems.stream()
            .allMatch(
                i ->
                    i.getUnits() != null
                        && i.getUnits() > 0
                        && i.getUnitPrice() != null
                        && i.getUnitPrice() > 0);
    if (!alreadyPopulated) {
      updateOrderItemsWithOrderData(orderItems, order, orderId);
      orderItemsRepository.saveAll(orderItems);
      log.info(
          "Updated {} order items (units & price) for orderId: {}", orderItems.size(), orderId);
    } else {
      log.debug("Order items already populated for orderId {} - skipping update", orderId);
    }
    createTransactionsForOrderItems(orderItems, order);
  }

  private void updateOrderItemsWithOrderData(
      List<OrderItems> orderItems, OrderData order, String orderId) {
    distributeUnits(orderItems, order.getAllottedUnits(), orderId);
    updateUnitPrice(orderItems, order.getPurchasedPrice(), orderId);
    orderItems.forEach(
        orderItem -> orderItem.setStatus(OrderStateMapper.toTransactionStatus(order.getState())));
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

  /**
   * Split total units evenly; last item absorbs any rounding drift ensuring exact sum conservation.
   * CALCULATION_SCALE provides high precision during division; DECIMAL_SCALE is final persisted
   * precision.
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

  private void updateUnitPrice(List<OrderItems> orderItems, Double purchasedPrice, String orderId) {
    if (purchasedPrice == null || purchasedPrice <= 0) {
      log.warn(
          "Purchased price missing or invalid for orderId {}. unitPrice will not be updated.",
          orderId);
      return;
    }

    orderItems.forEach(item -> item.setUnitPrice(purchasedPrice));
  }

  private void createTransactionsForOrderItems(List<OrderItems> orderItems, OrderData order) {
    // Idempotent transaction creation: skip if repository missing (test context) or already exists.
    // Negative units logic for SELL/SWP can be added here when disposal flows are implemented.
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
      if (transactionRepository.existsBySourceOrderItemId(item.getId())) {
        log.info("Transaction already exists for orderItemId {}", item.getId());
        continue; // idempotent skip
      }
      var txn =
          transactionRepository.findBySourceOrderItemId(item.getId()).orElseGet(Transaction::new);
      txn.setUser(item.getUser());
      txn.setGoal(item.getOrder() != null ? item.getOrder().getGoal() : null);
      txn.setFund(item.getFund());
      txn.setFolio(folio); // associate with folio
      txn.setType(TransactionType.BUY);
      txn.setUnits(Objects.requireNonNullElse(item.getUnits(), 0d));
      txn.setUnitPrice(Objects.requireNonNullElse(item.getUnitPrice(), 0d));
      txn.setAmount(Math.abs(txn.getUnits() * txn.getUnitPrice()));
      txn.setExternalRef(item.getRef());
      txn.setSourceOrderItemId(item.getId());
      // TODO: fix executedAt handling
      txn.setExecutedAt(Timestamp.from(Instant.now()));
      txn.setStatus(OrderStateMapper.toTransactionStatus(order.getState()));
      txn.setGoal(item.getOrder() != null ? item.getOrder().getGoal() : null);
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
      log.info("Created {} transaction(s) from order items", created);
    }
  }

  /**
   * Retrieves an existing Folio by reference or creates a new one if not found. Associates the
   * folio with the first order item's user, investor, and fund.
   */
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
