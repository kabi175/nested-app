package com.nested.app.jobs;

import com.nested.app.client.mf.SipOrderApiClient;
import com.nested.app.client.mf.dto.OrderData;
import com.nested.app.client.mf.dto.SipOrderDetail;
import com.nested.app.entity.Folio;
import com.nested.app.entity.OrderItems;
import com.nested.app.entity.SIPOrder;
import com.nested.app.entity.Transaction;
import com.nested.app.enums.TransactionStatus;
import com.nested.app.enums.TransactionType;
import com.nested.app.mapper.OrderStateMapper;
import com.nested.app.repository.FolioRepository;
import com.nested.app.repository.OrderItemsRepository;
import com.nested.app.repository.SIPOrderRepository;
import com.nested.app.repository.TransactionRepository;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.CronScheduleBuilder;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobBuilder;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.TriggerBuilder;
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
    private final SIPOrderRepository sipOrderRepository;
    private final Scheduler scheduler;

    @Override
    public void execute(JobExecutionContext context) throws JobExecutionException {
        JobDataMap data = context.getMergedJobDataMap();
        var orderRef = data.getString("orderRef");

        var orderItems = orderItemsRepository.findByRef(orderRef);
        if (orderItems.isEmpty()) {
            log.warn("No OrderItem found for orderRef {}", orderRef);
            return;
        }
        var orderItem = orderItems.getFirst();

        var purchaseOrder = sipOrderApiClient.fetchSipOrderDetail(orderRef).block();
        if (purchaseOrder == null) {
            log.warn("Provider returned no plan detail for orderRef {}", orderRef);
            return;
        }

        updateOrderItemStatus(orderItem, purchaseOrder);
        trackNewInstallments(orderItem);
        syncNextRunDate(orderItem, purchaseOrder);

        orderItemsRepository.save(orderItem);
        log.info("Tracked SIP order {}", orderRef);
    }

    // ---------------------------------------------------------------------------
    // Step 1 — reflect provider plan state onto the local OrderItem
    // ---------------------------------------------------------------------------

    private void updateOrderItemStatus(OrderItems orderItem, SipOrderDetail purchaseOrder) {
        switch (purchaseOrder.getState()) {
            case COMPLETED -> orderItem.setStatus(TransactionStatus.COMPLETED);
            case CANCELLED, FAILED -> orderItem.setStatus(TransactionStatus.FAILED);
            case ACTIVE -> orderItem.setStatus(TransactionStatus.ACTIVE);
            default ->
                    log.info("Unhandled plan state {} for orderRef {}", purchaseOrder.getState(), orderItem.getRef());
        }
    }

    // ---------------------------------------------------------------------------
    // Step 2 — create Transaction records for any new installments and schedule
    //           a 6-hour fulfillment sync job for each until it reaches a
    //           terminal state (SUCCESSFUL / FAILED / CANCELLED / REVERSED).
    // ---------------------------------------------------------------------------

    void trackNewInstallments(OrderItems orderItem) {
        var transactions = sipOrderApiClient.fetchTransactionDetails(orderItem.getRef()).block();
        if (transactions == null || transactions.isEmpty()) {
            log.info("No installments found for orderRef {}", orderItem.getRef());
            return;
        }

        List<OrderData> newInstallments = filterNewInstallments(transactions, orderItem.getLastProcessedTransactionRef());
        if (newInstallments.isEmpty()) {
            log.info("No new installments to process for orderRef {}", orderItem.getRef());
            return;
        }

        log.info("Processing {} new installment(s) for orderRef {}", newInstallments.size(), orderItem.getRef());

        // Process oldest-first so lastProcessedTransactionRef ends up pointing at the newest
        newInstallments = newInstallments.reversed();
        for (var installment : newInstallments) {
            var txn = createOrFetchTransaction(installment, orderItem);
            transactionRepository.save(txn);
            scheduleFulfillmentJob(installment.getRef());
            log.info("Saved transaction externalRef={}", txn.getExternalRef());
        }

        orderItem.setLastProcessedTransactionRef(newInstallments.getFirst().getRef());
    }

    /**
     * Returns installments that have not been processed yet. Provider returns newest-first; the last
     * processed ref acts as a cursor.
     */
    private List<OrderData> filterNewInstallments(List<OrderData> all, String lastProcessedRef) {
        if (lastProcessedRef == null) {
            return all;
        }
        int lastIndex = -1;
        for (int i = 0; i < all.size(); i++) {
            if (lastProcessedRef.equals(all.get(i).getRef())) {
                lastIndex = i;
                break;
            }
        }
        if (lastIndex == -1) {
            log.warn("lastProcessedTransactionRef {} not found in installment list — processing all", lastProcessedRef);
            return all;
        }
        return all.subList(0, lastIndex); // entries before lastIndex are newer
    }

    private Transaction createOrFetchTransaction(OrderData installment, OrderItems orderItem) {
        var existing = transactionRepository.findByExternalRef(installment.getRef());
        if (!existing.isEmpty()) {
            return existing.getFirst();
        }

        Folio folio = null;
        if (installment.getFolioRef() != null && !installment.getFolioRef().isEmpty()) {
            folio = getOrCreateFolio(installment.getFolioRef(), List.of(orderItem));
        }

        var txn = new Transaction();
        txn.setUser(orderItem.getUser());
        txn.setGoal(orderItem.getOrder() != null ? orderItem.getOrder().getGoal() : null);
        txn.setFund(orderItem.getFund());
        txn.setFolio(folio);
        txn.setType(TransactionType.SIP);
        txn.setUnits(Objects.requireNonNullElse(installment.getAllottedUnits(), 0d));
        txn.setUnitPrice(Objects.requireNonNullElse(installment.getPurchasedPrice(), 0d));
        txn.setExternalRef(installment.getRef());
        txn.setSourceOrderItemId(orderItem.getId());
        txn.setExecutedAt(
                installment.getSucceededAt() != null
                        ? installment.getSucceededAt()
                        : Timestamp.from(Instant.now()));
        txn.setStatus(OrderStateMapper.toTransactionStatus(installment.getState()));

        // Use estimated amount for in-flight installments; compute from units once allotted
        var status = txn.getStatus();
        txn.setAmount(
                status == TransactionStatus.COMPLETED
                        ? Math.abs(txn.getUnits() * txn.getUnitPrice())
                        : orderItem.getAmount());

        return txn;
    }

    // ---------------------------------------------------------------------------
    // Step 3 — sync SIPOrder.nextRunDate from provider's next_installment_date
    //           so the local scheduler uses the provider's schedule, not local math.
    // ---------------------------------------------------------------------------

    private void syncNextRunDate(OrderItems orderItem, SipOrderDetail purchaseOrder) {
        if (!(orderItem.getOrder() instanceof SIPOrder sipOrder)) {
            log.warn("OrderItem id={} does not belong to a SIPOrder, skipping nextRunDate sync", orderItem.getId());
            return;
        }

        var state = purchaseOrder.getState();
        if (state == SipOrderDetail.OrderState.COMPLETED
                || state == SipOrderDetail.OrderState.CANCELLED
                || state == SipOrderDetail.OrderState.FAILED) {
            sipOrder.setActive(false);
            sipOrder.setScheduleStatus(SIPOrder.ScheduleStatus.COMPLETED);
            log.info("SIPOrder id={} plan reached terminal state {}, marked COMPLETED", sipOrder.getId(), state);
        } else if (purchaseOrder.getNextRunDate() != null) {
            LocalDate nextDate = purchaseOrder.getNextRunDate()
                    .toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            sipOrder.setNextRunDate(nextDate);
            sipOrder.setScheduleStatus(SIPOrder.ScheduleStatus.ACTIVE);
            log.info("SIPOrder id={} nextRunDate synced to {} from provider", sipOrder.getId(), nextDate);
        }

        sipOrderRepository.save(sipOrder);
    }

    // ---------------------------------------------------------------------------
    // Quartz helpers
    // ---------------------------------------------------------------------------

    /**
     * Schedules a SipTransactionFulfillmentJob that polls every 6 hours until the installment
     * reaches a terminal state (SUCCESSFUL / FAILED / CANCELLED / REVERSED).
     */
    private void scheduleFulfillmentJob(String transactionRef) {
        try {
            String jobIdentity = "sip-txn-fulfillment-" + transactionRef;
            JobKey jobKey = new JobKey(jobIdentity);

            if (scheduler.checkExists(jobKey)) {
                log.info("Fulfillment job already exists for transactionRef {}", transactionRef);
                return;
            }

            var jobDetail =
                    JobBuilder.newJob(SipTransactionFulfillmentJob.class)
                            .withIdentity(jobIdentity)
                            .usingJobData("transactionRef", transactionRef)
                            .storeDurably()
                            .requestRecovery(true)
                            .build();

            var trigger =
                    TriggerBuilder.newTrigger()
                            .withIdentity(jobIdentity + "-trigger")
                            .forJob(jobKey)
                            .startNow()
                            .withSchedule(
                                    CronScheduleBuilder.cronSchedule("0 0 */6 * * ?")
                                            .withMisfireHandlingInstructionFireAndProceed())
                            .build();

            scheduler.scheduleJob(jobDetail, trigger);
            log.info("Scheduled fulfillment job for transactionRef {}", transactionRef);
        } catch (SchedulerException e) {
            log.error("Failed to schedule fulfillment job for transactionRef {}", transactionRef, e);
        }
    }

    private Folio getOrCreateFolio(String folioRef, List<OrderItems> orderItems) {
        return folioRepository
                .findByRef(folioRef)
                .orElseGet(
                        () -> {
                            if (orderItems.isEmpty()) {
                                log.warn("Cannot create folio {} — no order items available", folioRef);
                                return null;
                            }
                            var firstItem = orderItems.getFirst();
                            var folio = new Folio();
                            folio.setRef(folioRef);
                            folio.setUser(firstItem.getUser());
                            folio.setFund(firstItem.getFund());
                            if (firstItem.getUser() != null && firstItem.getUser().getInvestor() != null) {
                                folio.setInvestor(firstItem.getUser().getInvestor());
                            }
                            var saved = folioRepository.save(folio);
                            log.info("Created Folio ref={} for user={} fund={}",
                                    folioRef, firstItem.getUser().getId(), firstItem.getFund().getId());
                            return saved;
                        });
    }
}
