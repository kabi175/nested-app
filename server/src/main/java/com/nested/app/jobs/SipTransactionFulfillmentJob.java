package com.nested.app.jobs;

import com.nested.app.client.mf.BuyOrderApiClient;
import com.nested.app.client.mf.dto.OrderData;
import com.nested.app.entity.Folio;
import com.nested.app.entity.OrderItems;
import com.nested.app.entity.Transaction;
import com.nested.app.enums.TransactionStatus;
import com.nested.app.events.GoalSyncEvent;
import com.nested.app.events.TransactionSuccessEvent;
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
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
@DisallowConcurrentExecution
public class SipTransactionFulfillmentJob implements Job {

    private final BuyOrderApiClient buyOrderApiClient;
    private final TransactionRepository transactionRepository;
    private final OrderItemsRepository orderItemsRepository;
    private final FolioRepository folioRepository;
    private final Scheduler scheduler;
    private final ApplicationEventPublisher publisher;

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        JobDataMap data = context.getMergedJobDataMap();
        var transactionRef = data.getString("transactionRef");

        log.info("SipTransactionFulfillmentJob start transactionRef={}", transactionRef);

        var orderData = buyOrderApiClient.fetchOrderDetails(transactionRef).block();
        if (orderData == null) {
            log.error("No order data found for transactionRef {}", transactionRef);
            deleteJob(context);
            return;
        }

        var existing = transactionRepository.findByExternalRef(transactionRef);
        if (existing.isEmpty()) {
            log.warn("No Transaction record found for transactionRef {}", transactionRef);
            deleteJob(context);
            return;
        }

        var txn = existing.getFirst();
        updateTransaction(txn, orderData);
        transactionRepository.save(txn);

        log.info("Transaction {} synced with status {}", txn.getId(), txn.getStatus());

        if (isTerminalState(orderData.getState())) {
            if (txn.getGoal() != null) {
                publisher.publishEvent(new GoalSyncEvent(txn.getGoal().getId(), txn.getUser()));
            } else {
                log.warn("Goal not populated for transaction {}", txn.getId());
            }
            if (txn.getStatus() == TransactionStatus.COMPLETED) {
                publisher.publishEvent(
                        new TransactionSuccessEvent(
                                txn.getUser(),
                                txn.getFund() != null ? txn.getFund().getName() : null,
                                txn.getAmount(),
                                txn.getType()));
                log.info("Transaction {} has been completed", txn.getId());
            }
            deleteJob(context);
        }
    }

    private void updateTransaction(Transaction txn, OrderData orderData) {
        txn.setStatus(OrderStateMapper.toTransactionStatus(orderData.getState()));

        double units = Objects.requireNonNullElse(orderData.getAllottedUnits(), 0d);
        double unitPrice = Objects.requireNonNullElse(orderData.getPurchasedPrice(), 0d);
        txn.setUnits(units);
        txn.setUnitPrice(unitPrice);
        var amount = Math.abs(units * unitPrice);
        if (orderData.getState() == OrderData.OrderState.SUBMITTED || amount == 0) {
            txn.setAmount(orderData.getAmount());
        } else {
            txn.setAmount(amount);
        }
        if (orderData.getSucceededAt() != null) {
            txn.setExecutedAt(orderData.getSucceededAt());
        } else if (txn.getExecutedAt() == null) {
            txn.setExecutedAt(Timestamp.from(Instant.now()));
        }

        // Associate folio if not yet set
        if (txn.getFolio() == null
                && orderData.getFolioRef() != null
                && !orderData.getFolioRef().isEmpty()) {
            List<OrderItems> orderItems =
                    txn.getSourceOrderItemId() != null
                            ? orderItemsRepository.findById(txn.getSourceOrderItemId())
                            .map(List::of)
                            .orElse(List.of())
                            : List.of();
            Folio folio = getOrCreateFolio(orderData.getFolioRef(), orderItems);
            txn.setFolio(folio);
        }
    }

    private boolean isTerminalState(OrderData.OrderState state) {
        return List.of(
                        OrderData.OrderState.SUCCESSFUL,
                        OrderData.OrderState.FAILED,
                        OrderData.OrderState.CANCELLED,
                        OrderData.OrderState.REVERSED)
                .contains(state);
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

    private void deleteJob(JobExecutionContext context) throws JobExecutionException {
        try {
            scheduler.deleteJob(context.getJobDetail().getKey());
            log.info(
                    "SipTransactionFulfillmentJob deleted for transactionRef: {}",
                    context.getMergedJobDataMap().getString("transactionRef"));
        } catch (SchedulerException e) {
            throw new JobExecutionException(e);
        }
    }
}
