package com.nested.app.services;

import com.nested.app.client.mf.SipOrderApiClient;
import com.nested.app.client.mf.dto.OrderData;
import com.nested.app.entity.SIPOrder;
import com.nested.app.entity.Transaction;
import com.nested.app.enums.TransactionType;
import com.nested.app.events.TransactionSuccessEvent;
import com.nested.app.jobs.SipOrderVerificationJob;
import com.nested.app.repository.SIPOrderRepository;
import com.nested.app.repository.TransactionRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Scheduler-oriented service that advances and polls SIPOrders instead of using a separate schedule
 * entity. Responsibilities: - Identify due ACTIVE SIPOrders and transition them to RUNNING with a
 * generated provider ref. - Poll RUNNING SIPOrders for successful fills from provider and persist
 * Transaction rows. - Advance nextRunDate with month boundary clamping and update lifecycle status
 * (ACTIVE/COMPLETED/ERROR). - Maintain idempotency using providerTransactionId to avoid duplicate
 * transactions.
 *
 * <p>Notes: - Uses blocking calls (.block()) inside @Transactional methods; acceptable for current
 * design but consider moving provider calls outside the transaction if latency grows. - Assumes at
 * least one OrderItem exists to derive Fund for Transactions; guarded in code.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SipOrderSchedulerService {
  // Repository to fetch and persist SIPOrder state transitions
  private final SIPOrderRepository sipOrderRepository;
  // Client for provider API interactions (place/confirm/fetch transactions)
  private final SipOrderApiClient sipOrderApiClient;
  // Ledger repository for idempotent transaction writes
  private final TransactionRepository transactionRepository;
  private final Scheduler scheduler;
  private final ApplicationEventPublisher publisher;

  /**
   * Scan for due SIPOrders (scheduleStatus=ACTIVE) and mark them RUNNING with a generated orderRef.
   * The due logic relies on SIPOrder#due(LocalDate) which compares nextRunDate vs today.
   */
  @Transactional
  public void runDueOrders() {
    LocalDate todayUtc = LocalDate.now(ZoneId.of("UTC"));
    var activeOrders =
        sipOrderRepository.findByIsActiveTrueAndScheduleStatus(SIPOrder.ScheduleStatus.ACTIVE);
    for (SIPOrder order : activeOrders) {
      // Skip if not yet due according to schedule semantics
      if (!order.due(convertToLocal(order, todayUtc))) continue;
      try {
        // TODO: Replace stub ref with real provider placement response (placeSipOrder + confirm)
        String orderRef = "SIPORD-" + order.getId() + "-" + System.currentTimeMillis();
        order.setLastOrderRef(orderRef);
        order.setScheduleStatus(SIPOrder.ScheduleStatus.RUNNING);
        order.setLastAttemptAt(java.sql.Timestamp.from(java.time.Instant.now()));
        sipOrderRepository.save(order);
        log.info("Started SIPOrder id={} ref={}", order.getId(), orderRef);
      } catch (Exception e) {
        // Increment failure count and place order into ERROR if needed (threshold can be
        // externalized)
        order.setFailureCount(order.getFailureCount() + 1);
        order.setScheduleStatus(SIPOrder.ScheduleStatus.ERROR);
        sipOrderRepository.save(order);
        log.error("Failed starting SIPOrder id={}: {}", order.getId(), e.getMessage(), e);
      }
    }
  }

  /**
   * Poll all RUNNING SIPOrders for provider fills. For each successful fill: - Idempotently persist
   * Transaction (skip if providerTransactionId already recorded) - Advance nextRunDate by one month
   * (clamped to month end if necessary) - Transition scheduleStatus to ACTIVE for next cycle or
   * COMPLETED if past endDate
   */
  @Transactional
  public void pollRunningOrders() {
    var running = sipOrderRepository.findByScheduleStatus(SIPOrder.ScheduleStatus.RUNNING);
    for (SIPOrder order : running) {
      if (order.getLastOrderRef() == null) continue; // Nothing to poll yet
      try {
        // Fetch up to latest provider-side order executions (returns recent transaction-like
        // entries)
        var providerTxns =
            sipOrderApiClient.fetchTransactionDetails(order.getLastOrderRef()).block();
        if (providerTxns == null || providerTxns.isEmpty()) continue; // Still pending

        // Filter only successful executions
        var fills =
            providerTxns.stream()
                .filter(o -> OrderData.OrderState.SUCCESSFUL.equals(o.getState()))
                .toList();
        if (fills.isEmpty()) continue; // No success yet

        int created = 0;
        for (OrderData fill : fills) {
          String providerId = fill.getRef();
          // Idempotency: skip if we already recorded this provider transaction
          if (providerId != null && transactionRepository.existsByProviderTransactionId(providerId))
            continue;

          Double units = fill.getAllottedUnits();
          Double price = fill.getPurchasedPrice();
          if (units == null || price == null || units <= 0 || price <= 0)
            continue; // Ignore incomplete fills

          // Defensive: ensure we have at least one item to derive Fund; otherwise skip
          if (order.getItems() == null || order.getItems().isEmpty()) {
            log.warn(
                "SIPOrder id={} has no OrderItems; skipping transaction creation", order.getId());
            continue;
          }

          var txn = new Transaction();
          txn.setUser(order.getUser());
          txn.setGoal(order.getGoal());
          txn.setFund(
              order
                  .getItems()
                  .getFirst()
                  .getFund()); // Simplified: using first fund; TODO multi-fund proportional
          // allocation if basket evolves.
          txn.setType(TransactionType.SIP);
          txn.setUnits(units);
          txn.setUnitPrice(price);
          txn.setAmount(Math.abs(units * price));
          txn.setExecutedAt(new java.sql.Timestamp(System.currentTimeMillis()));
          txn.setProviderTransactionId(providerId);
          txn.setExternalRef(order.getLastOrderRef());
          transactionRepository.save(txn);
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
          log.info("Persisted {} SIP transactions for order id={}", created, order.getId());
        }

        // Advance schedule (month increment with end-of-month clamp)
        LocalDate next = computeNextRunDate(order);
        order.setNextRunDate(next);
        order.setScheduleStatus(
            order.getEndDate().isBefore(next)
                ? SIPOrder.ScheduleStatus.COMPLETED
                : SIPOrder.ScheduleStatus.ACTIVE);
        sipOrderRepository.save(order);
      } catch (Exception e) {
        order.setFailureCount(order.getFailureCount() + 1);
        if (order.getFailureCount() > 5) order.setScheduleStatus(SIPOrder.ScheduleStatus.ERROR);
        sipOrderRepository.save(order);
        log.error("Error polling SIPOrder id={}: {}", order.getId(), e.getMessage(), e);
      }
    }
  }

  /**
   * Schedules a SIP order verification job to run 10 seconds after this method is called.
   *
   * @param paymentID The payment ID to verify
   */
  public void scheduleVerificationJob(Long paymentID) {
    try {
      String jobIdentity = "sip-verify-" + paymentID;

      JobDetail jobDetail =
          JobBuilder.newJob(SipOrderVerificationJob.class)
              .withIdentity(jobIdentity)
              .usingJobData("paymentID", paymentID)
              .storeDurably()
              .requestRecovery(true)
              .build();

      Trigger trigger =
          TriggerBuilder.newTrigger()
              .withIdentity(jobIdentity + "-trigger")
              .forJob(jobDetail)
              .withSchedule(
                  SimpleScheduleBuilder.simpleSchedule()
                      .withIntervalInSeconds(10)
                      .withMisfireHandlingInstructionFireNow()
                      .withRepeatCount(0)) // Run once
              .startNow()
              .build();

      scheduler.scheduleJob(jobDetail, trigger);
      log.info(
          "Scheduled SIP order verification job for payment ID: {} to run in 10 seconds",
          paymentID);

    } catch (Exception e) {
      log.warn(
          "Failed to schedule SIP order verification job for payment ID: {}. Error: {}",
          paymentID,
          e.getMessage());
      // Graceful error handling - log warning but don't throw exception
    }
  }

  /**
   * Computes the next run date by adding one month to the current nextRunDate and clamping to the
   * last day of month if original target day exceeds month length.
   */
  private LocalDate computeNextRunDate(SIPOrder order) {
    LocalDate candidate = order.getNextRunDate().plusMonths(1);
    int targetDay = order.getStartDate().getDayOfMonth(); // Original SIP initiation day
    int length = candidate.lengthOfMonth();
    if (targetDay > length) targetDay = length; // Month-end clamp (e.g., 31st -> 28/29 Feb)
    return LocalDate.of(candidate.getYear(), candidate.getMonth(), targetDay);
  }

  /**
   * Converts UTC 'today' to local representation (placeholder: system default). If user-specific
   * time zones become needed, store a zone on SIPOrder and apply it here.
   */
  private LocalDate convertToLocal(SIPOrder order, LocalDate utc) {
    ZonedDateTime zdt =
        utc.atStartOfDay(ZoneId.of("UTC")).withZoneSameInstant(ZoneId.systemDefault());
    return zdt.toLocalDate();
  }
}
