package com.nested.app.jobs;

import com.nested.app.client.mf.SipOrderApiClient;
import com.nested.app.client.mf.dto.OrderData;
import com.nested.app.client.mf.dto.SipOrderDetail;
import com.nested.app.entity.Folio;
import com.nested.app.entity.OrderItems;
import com.nested.app.entity.Transaction;
import com.nested.app.enums.TransactionStatus;
import com.nested.app.enums.TransactionType;
import com.nested.app.mapper.OrderStateMapper;
import com.nested.app.repository.FolioRepository;
import com.nested.app.repository.OrderItemsRepository;
import com.nested.app.repository.TransactionRepository;
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
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@DisallowConcurrentExecution
public class SipTransactionTracker implements Job {

  private final OrderItemsRepository orderItemsRepository;
  private final SipOrderApiClient sipOrderApiClient;
  private final TransactionRepository transactionRepository;
  private final FolioRepository folioRepository;

  @Override
  public void execute(JobExecutionContext context) throws JobExecutionException {
    JobDataMap data = context.getMergedJobDataMap();
    var orderRef = data.getString("orderRef");
    var orderItems = orderItemsRepository.findByRef(orderRef);
    if (orderItems.isEmpty()) {
      log.info("No order found with orderRef {}", orderRef);
      return;
    }

    var orderItem = orderItems.getFirst();
    var purchaseOrder = sipOrderApiClient.fetchSipOrderDetail(orderRef).block();
    if (purchaseOrder == null) {
      log.info("No order found with orderRef {}", orderRef);
      return;
    }

    switch (purchaseOrder.getState()) {
      case COMPLETED:
        orderItem.setStatus(TransactionStatus.COMPLETED);
        break;
      case CANCELLED:
      case FAILED:
        // TODO: handle cancelled state properly
        orderItem.setStatus(TransactionStatus.FAILED);
        break;
      case ACTIVE:
        trackTransaction(orderItem, purchaseOrder);
        break;

      default:
        log.info("Unknown state {}", purchaseOrder.getState());
    }
  }

  void trackTransaction(OrderItems orderItem, SipOrderDetail purchaseOrder) {
    var transactions = sipOrderApiClient.fetchTransactionDetails(orderItem.getRef()).block();
    if (transactions == null || transactions.isEmpty()) {
      log.info("No transaction found with orderRef {}", orderItem.getRef());
      return;
    }

    var lastProcessedTransactionRef = orderItem.getLastProcessedTransactionRef();

    // Filter transactions generated after the lastProcessedTransactionRef
    List<OrderData> newTransactions;
    if (lastProcessedTransactionRef == null) {
      // No previous processing, take all transactions
      newTransactions = transactions;
    } else {
      // Find the index of the last processed transaction and get all transactions after it
      int lastProcessedIndex = -1;
      for (int i = 0; i < transactions.size(); i++) {
        if (lastProcessedTransactionRef.equals(transactions.get(i).getRef())) {
          lastProcessedIndex = i;
          break;
        }
      }

      if (lastProcessedIndex == -1) {
        // Last processed ref not found, process all transactions
        log.warn(
            "Last processed transaction ref {} not found in transactions list, processing all",
            lastProcessedTransactionRef);
        newTransactions = transactions;
      } else {
        // Get transactions after the last processed one (newer transactions come first)
        newTransactions = transactions.subList(0, lastProcessedIndex);
      }
    }

    if (newTransactions.isEmpty()) {
      log.info("No new transactions to process for orderRef {}", orderItem.getRef());
      return;
    }

    log.info("Processing {} new transactions for orderRef {}", newTransactions.size(), orderItem.getRef());

    // Process new transactions (in reverse order to process oldest first)
    for (int i = newTransactions.size() - 1; i >= 0; i--) {
      var orderData = newTransactions.get(i);
      var txn = convert(orderData, orderItem);
      transactionRepository.save(txn);
      log.info("Saved transaction with externalRef {}", txn.getExternalRef());
    }

    // Update the last processed transaction ref to the newest one
    orderItem.setLastProcessedTransactionRef(newTransactions.getFirst().getRef());
    orderItemsRepository.save(orderItem);
  }

  Transaction convert(OrderData orderData, OrderItems orderItem) {
    var exTxn = transactionRepository.findByExternalRef(orderData.getRef());
    if (!exTxn.isEmpty()) {
      return exTxn.getFirst();
    }

    Folio folio = null;
    if (orderData.getFolioRef() != null
        && !orderData.getFolioRef().isEmpty()
        && folioRepository != null) {
      folio = getOrCreateFolio(orderData.getFolioRef(), List.of(orderItem));
    }

    var txn = new Transaction();
    txn.setUser(orderItem.getUser());
    txn.setGoal(orderItem.getOrder() != null ? orderItem.getOrder().getGoal() : null);
    txn.setFund(orderItem.getFund());
    txn.setFolio(folio); // associate with folio
    txn.setType(TransactionType.SIP);
    txn.setUnits(Objects.requireNonNullElse(orderData.getAllottedUnits(), 0d));
    txn.setUnitPrice(Objects.requireNonNullElse(orderData.getPurchasedPrice(), 0d));
    txn.setExternalRef(orderData.getRef());
    txn.setSourceOrderItemId(orderItem.getId());
    txn.setExecutedAt(
        orderData.getSucceededAt() != null
            ? orderData.getSucceededAt()
            : Timestamp.from(Instant.now()));
    txn.setStatus(OrderStateMapper.toTransactionStatus(orderData.getState()));

    // Calculate amount based on status
    if (!Objects.equals(TransactionStatus.COMPLETED, txn.getStatus())) {
      txn.setAmount(orderItem.getAmount());
    } else {
      txn.setAmount(Math.abs(txn.getUnits() * txn.getUnitPrice()));
    }

    return txn;
  }

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
}
