package com.nested.app.jobs;

import com.nested.app.client.mf.SellOrderApiClient;
import com.nested.app.client.mf.dto.OrderData;
import com.nested.app.entity.Order;
import com.nested.app.entity.OrderItems;
import com.nested.app.entity.Transaction;
import com.nested.app.enums.TransactionStatus;
import com.nested.app.enums.TransactionType;
import com.nested.app.repository.OrderItemsRepository;
import com.nested.app.repository.TransactionRepository;
import java.util.List;
import java.util.Objects;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.springframework.stereotype.Component;

/**
 * Quartz job responsible for tracking and updating the status of redeem (sell) orders.
 *
 * <p>This job periodically polls the external mutual fund API to fetch the latest status of redeem
 * orders and updates the corresponding transactions in the database. It handles the complete
 * lifecycle of a redeem order from creation to completion/failure/reversal.
 *
 * <p>The job performs the following operations:
 *
 * <ul>
 *   <li>Fetches order details from the external sell order API
 *   <li>Creates or updates transactions based on order status
 *   <li>Maps external order states to internal transaction statuses
 *   <li>Updates transaction amounts, units, and execution timestamps
 * </ul>
 *
 * @see Transaction
 * @see OrderData
 * @see SellOrderApiClient
 */
@Slf4j
@Component
@AllArgsConstructor
public class RedeemOrderTrackerJob implements Job {
  private SellOrderApiClient sellOrderApiClient;
  private OrderItemsRepository orderItemsRepository;
  private TransactionRepository transactionRepository;
  private Scheduler scheduler;

  /**
   * Executes the redeem order tracking job.
   *
   * <p>Retrieves the order reference from the job context, fetches the latest order details from
   * the external API, and updates all associated transactions with the current status, amounts, and
   * execution timestamps.
   *
   * @param context the job execution context containing the order ID in the job data map
   * @throws JobExecutionException if an error occurs during job execution
   */
  @Override
  public void execute(JobExecutionContext context) throws JobExecutionException {
    JobDataMap data = context.getMergedJobDataMap();
    String orderRef = data.getString("orderId");

    log.info("Starting redeem order tracker job for order reference: {}", orderRef);

    try {
      var orderData = sellOrderApiClient.fetchOrderDetails(orderRef).block();
      if (orderData == null) {
        log.warn("No order data found for order reference: {}", orderRef);
        return;
      }

      log.debug(
          "Fetched order data for ref: {}, state: {}, redeemed amount: {}",
          orderRef,
          orderData.getState(),
          orderData.getRedeemedAmount());

      var transactions = transactionRepository.findByExternalRef(orderRef);
      if (transactions.isEmpty()) {
        log.info(
            "No existing transactions found for order ref: {}. Creating default transactions",
            orderRef);
        transactions = populateDefaultTransactions(orderData);

        if (transactions.isEmpty()) {
          log.warn(
              "Could not create default transactions for order ref: {}. No order items found",
              orderRef);
          return;
        }
      }

      log.debug("Processing {} transaction(s) for order ref: {}", transactions.size(), orderRef);

      transactions.forEach(
          transaction -> {
            TransactionStatus previousStatus = transaction.getStatus();
            transaction.setUnits(-orderData.getRedeemedUnits());
            transaction.setUnitPrice(orderData.getRedeemedPrice());
            transaction.setAmount(-orderData.getRedeemedAmount());

            switch (orderData.getState()) {
              case CREATED, PENDING, UNDER_REVIEW:
                transaction.setStatus(TransactionStatus.VERIFICATION_PENDING);
                break;
              case CONFIRMED, SUBMITTED:
                transaction.setStatus(TransactionStatus.SUBMITTED);
                transaction.setExecutedAt(orderData.getSubmittedAt());
                break;
              case SUCCESSFUL:
                transaction.setStatus(TransactionStatus.COMPLETED);
                transaction.setExecutedAt(orderData.getSubmittedAt());
                break;
              case FAILED, CANCELLED:
                transaction.setStatus(TransactionStatus.FAILED);
                transaction.setExecutedAt(orderData.getFailedAt());
                break;
              case REVERSED:
                transaction.setStatus(TransactionStatus.REFUNDED);
                transaction.setExecutedAt(orderData.getReversedAt());
                break;
              default:
                log.warn(
                    "Unknown order state: {} for order ref: {}", orderData.getState(), orderRef);
            }

            if (previousStatus != transaction.getStatus()) {
              log.info(
                  "Transaction status updated for order ref: {} - {} -> {}",
                  orderRef,
                  previousStatus,
                  transaction.getStatus());
            }
          });

      transactionRepository.saveAll(transactions);
      log.info(
          "Successfully updated {} transaction(s) for order ref: {} with status: {}",
          transactions.size(),
          orderRef,
          orderData.getState());
      var orderItems = orderItemsRepository.findByRef(orderData.getRef());

      var orders = orderItems.stream().map(OrderItems::getOrder).distinct().toList();

      orders.forEach(
          order -> {
            switch (orderData.getState()) {
              case CREATED, PENDING, UNDER_REVIEW, CONFIRMED, SUBMITTED:
                order.setStatus(Order.OrderStatus.PLACED);
                break;
              case SUCCESSFUL:
                order.setStatus(Order.OrderStatus.COMPLETED);
                break;
              case FAILED, CANCELLED:
                order.setStatus(Order.OrderStatus.FAILED);
                break;
              case REVERSED:
                order.setStatus(Order.OrderStatus.REVERSED);
            }
          });

      if (List.of(
              OrderData.OrderState.SUCCESSFUL,
              OrderData.OrderState.FAILED,
              OrderData.OrderState.CANCELLED)
          .contains(orderData.getState())) {
        deleteJob(context);
      }

    } catch (Exception e) {
      log.error("Error processing redeem order tracker job for order ref: {}", orderRef, e);
      throw new JobExecutionException("Failed to process redeem order: " + orderRef, e);
    }
  }

  /**
   * Creates default transactions for a new order that doesn't have existing transactions.
   *
   * <p>This method retrieves all order items associated with the given order reference and creates
   * a corresponding transaction for each item. Each transaction is initialized with data from both
   * the order item and the current order data.
   *
   * @param orderData the order data containing order details and status
   * @return a list of newly created transactions, or an empty list if no order items are found
   */
  private List<Transaction> populateDefaultTransactions(OrderData orderData) {
    log.debug("Populating default transactions for order ref: {}", orderData.getRef());

    var orderItems = orderItemsRepository.findByRef(orderData.getRef());
    if (orderItems == null || orderItems.isEmpty()) {
      log.warn("No order items found for order ref: {}", orderData.getRef());
      return List.of();
    }

    log.debug("Found {} order item(s) for order ref: {}", orderItems.size(), orderData.getRef());

    List<Transaction> transactions =
        orderItems.stream()
            .map(
                oi -> {
                  var transaction = new Transaction();
                  transaction.setAmount(oi.getAmount());
                  transaction.setExternalRef(orderData.getRef());
                  transaction.setUser(oi.getUser());
                  transaction.setGoal(oi.getOrder().getGoal());
                  transaction.setFund(oi.getFund());
                  transaction.setType(TransactionType.SELL);
                  transaction.setStatus(TransactionStatus.VERIFICATION_PENDING);
                  transaction.setUnits(
                      -Objects.requireNonNullElse(orderData.getRedeemedUnits(), (double) 0));
                  transaction.setUnitPrice(orderData.getRedeemedPrice());
                  transaction.setAmount(-orderData.getRedeemedAmount());
                  transaction.setExecutedAt(orderData.getSubmittedAt());
                  transaction.setSourceOrderItemId(oi.getId());

                  log.debug(
                      "Created transaction for order item ID: {}, fund: {}, amount: {}",
                      oi.getId(),
                      oi.getFund().getName(),
                      orderData.getRedeemedAmount());

                  return transaction;
                })
            .toList();

    log.info(
        "Created {} default transaction(s) for order ref: {}",
        transactions.size(),
        orderData.getRef());
    return transactions;
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
