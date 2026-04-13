package com.nested.app.services;

import com.nested.app.entity.OrderItems;
import com.nested.app.entity.SIPOrder;
import com.nested.app.entity.SIPOrder.ScheduleStatus;
import com.nested.app.enums.TransactionStatus;
import com.nested.app.jobs.SipOrderVerificationJob;
import com.nested.app.jobs.SipRunDueOrdersJob;
import com.nested.app.jobs.SipTransactionTracker;
import com.nested.app.repository.OrderItemsRepository;
import com.nested.app.repository.SIPOrderRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.DateBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Scheduler-oriented service that advances and polls SIPOrders instead of using a separate schedule
 * entity. Responsibilities: - Identify due ACTIVE SIPOrders (nextRunDate <= today) and transition
 * them to RUNNING with scheduled tracker jobs per OrderItem. - Advance nextRunDate after a cycle
 * completes (all OrderItems reach a terminal status) and reset scheduleStatus to ACTIVE. - Mark
 * scheduleStatus COMPLETED when nextRunDate would exceed endDate.
 *
 * <p>Notes: - Uses blocking calls (.block()) inside @Transactional methods; acceptable for current
 * design but consider moving provider calls outside the transaction if latency grows. - Assumes at
 * least one OrderItem exists to derive Fund for Transactions; guarded in code.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SipOrderSchedulerService {
  private final SIPOrderRepository sipOrderRepository;
  private final OrderItemsRepository orderItemsRepository;
  private final Scheduler scheduler;

  /**
   * Main entry point called daily at 05:00 by SipDueSchedulesJob.
   *
   * <p>Phase A: Advance any RUNNING SIPOrders whose OrderItems have all reached a terminal state
   * (COMPLETED or FAILED). Computes the next run date and resets scheduleStatus to ACTIVE, or marks
   * COMPLETED if the SIP has passed its endDate.
   *
   * <p>Phase B: Find all ACTIVE SIPOrders with nextRunDate <= today, transition them to RUNNING,
   * and schedule a SipTransactionTracker Quartz job for each of their OrderItems.
   */
  @Transactional
  public void runDueOrders() {
    LocalDate today = LocalDate.now();
    log.info("Starting SIP due-order run for date {}", today);

    advanceCompletedCycles();
    scheduleNewCycles(today);

    log.info("Completed SIP due-order run for date {}", today);
  }

  /**
   * Phase A: For each RUNNING SIPOrder whose OrderItems are all terminal, advance nextRunDate and
   * reset scheduleStatus to ACTIVE (or COMPLETED if past endDate).
   */
  private void advanceCompletedCycles() {
    List<SIPOrder> runningSips = sipOrderRepository.findByScheduleStatus(ScheduleStatus.RUNNING);
    log.debug("Phase A: found {} RUNNING SIP orders to check for cycle completion", runningSips.size());

    for (SIPOrder sip : runningSips) {
      boolean allTerminal =
          sip.getItems().stream()
              .allMatch(
                  item ->
                      item.getStatus() == TransactionStatus.COMPLETED
                          || item.getStatus() == TransactionStatus.FAILED);

      if (!allTerminal) {
        log.debug("SIPOrder id={} still has in-progress items, skipping advancement", sip.getId());
        continue;
      }

      LocalDate next = computeNextRunDate(sip);
      if (next.isAfter(sip.getEndDate())) {
        sip.setScheduleStatus(ScheduleStatus.COMPLETED);
        log.info("SIPOrder id={} completed — nextRunDate {} is past endDate {}", sip.getId(), next, sip.getEndDate());
      } else {
        sip.setNextRunDate(next);
        sip.setScheduleStatus(ScheduleStatus.ACTIVE);
        log.info("SIPOrder id={} advanced nextRunDate to {}", sip.getId(), next);
      }
    }

    sipOrderRepository.saveAll(runningSips.stream()
        .filter(s -> s.getScheduleStatus() != ScheduleStatus.RUNNING)
        .toList());
  }

  /**
   * Phase B: Find ACTIVE SIPOrders with nextRunDate <= today, transition to RUNNING, and schedule
   * a tracker job for each OrderItem that has a provider ref.
   */
  private void scheduleNewCycles(LocalDate today) {
    List<SIPOrder> dueSips =
        sipOrderRepository.findByScheduleStatusAndNextRunDateLessThanEqual(
            ScheduleStatus.ACTIVE, today);
    log.debug("Phase B: found {} due SIP orders for date {}", dueSips.size(), today);

    int totalScheduled = 0;
    int totalFailed = 0;

    for (int i = 0; i < dueSips.size(); i++) {
      SIPOrder sip = dueSips.get(i);
      sip.setScheduleStatus(ScheduleStatus.RUNNING);

      List<OrderItems> items = sip.getItems();
      for (OrderItems item : items) {
        try {
          scheduleSipTransactionTrackerJob(item, i);
          totalScheduled++;
        } catch (Exception e) {
          totalFailed++;
          log.error(
              "Failed to schedule SipTransactionTracker for orderItem id={}: {}",
              item.getId(),
              e.getMessage(),
              e);
        }
      }
    }

    sipOrderRepository.saveAll(dueSips);
    log.info(
        "Phase B complete. Scheduled: {}, Failed: {}, SIP orders transitioned to RUNNING: {}",
        totalScheduled, totalFailed, dueSips.size());
  }

  /**
   * Schedules a SipTransactionTracker job for an individual OrderItem. The job will track the SIP
   * transaction status by polling the provider.
   *
   * @param orderItem The OrderItem to track
   * @param index Stagger index to avoid thundering-herd on the provider
   */
  public void scheduleSipTransactionTrackerJob(OrderItems orderItem, int index) {
    if (orderItem.getRef() == null || orderItem.getRef().isEmpty()) {
      log.warn(
          "OrderItem id={} has no ref, skipping SipTransactionTracker scheduling",
          orderItem.getId());
      return;
    }

    try {
      String jobIdentity = "sip-transaction-tracker-" + orderItem.getId();
      JobKey jobKey = new JobKey(jobIdentity);

      Trigger trigger =
          TriggerBuilder.newTrigger()
              .withIdentity(jobIdentity + "-trigger-" + System.currentTimeMillis())
              .forJob(jobKey)
              .startAt(DateBuilder.futureDate(10 * (index + 1), DateBuilder.IntervalUnit.SECOND))
              .withSchedule(
                  SimpleScheduleBuilder.simpleSchedule().withMisfireHandlingInstructionFireNow())
              .build();

      if (scheduler.checkExists(jobKey)) {
        log.info(
            "SipTransactionTracker job already exists for orderItem id={}. Adding new trigger.",
            orderItem.getId());
        scheduler.scheduleJob(trigger);
      } else {
        JobDetail jobDetail =
            JobBuilder.newJob(SipTransactionTracker.class)
                .withIdentity(jobIdentity)
                .usingJobData("orderRef", orderItem.getRef())
                .storeDurably()
                .requestRecovery(true)
                .build();

        scheduler.scheduleJob(jobDetail, trigger);
      }
      log.info(
          "Scheduled SipTransactionTracker job for orderItem id={}, ref={}",
          orderItem.getId(),
          orderItem.getRef());

    } catch (Exception e) {
      log.warn(
          "Failed to schedule SipTransactionTracker job for orderItem id={}, ref={}. Error: {}",
          orderItem.getId(),
          orderItem.getRef(),
          e.getMessage());
    }
  }

  /**
   * Schedules a SipRunDueOrdersJob to run 10 seconds after this method is called. Used after SIP
   * order payment verification to immediately process newly-activated SIP orders.
   */
  public void scheduleRunDueOrdersJob() {
    try {
      String jobIdentity = "sip-run-due-orders-" + System.currentTimeMillis();
      JobDetail jobDetail =
          JobBuilder.newJob(SipRunDueOrdersJob.class)
              .withIdentity(jobIdentity)
              .storeDurably()
              .build();
      Trigger trigger =
          TriggerBuilder.newTrigger()
              .withIdentity(jobIdentity + "-trigger")
              .forJob(jobDetail)
              .startAt(DateBuilder.futureDate(30, DateBuilder.IntervalUnit.SECOND))
              .withSchedule(
                  SimpleScheduleBuilder.simpleSchedule()
                      .withMisfireHandlingInstructionFireNow()
                      .withRepeatCount(0))
              .build();
      scheduler.scheduleJob(jobDetail, trigger);
      log.info("Scheduled SipRunDueOrdersJob to run in 10 seconds");
    } catch (Exception e) {
      log.warn("Failed to schedule SipRunDueOrdersJob: {}", e.getMessage());
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
      JobKey jobKey = new JobKey(jobIdentity);

      Trigger trigger =
          TriggerBuilder.newTrigger()
              .withIdentity(jobIdentity + "-trigger-" + System.currentTimeMillis())
              .forJob(jobKey)
              .startAt(DateBuilder.futureDate(10, DateBuilder.IntervalUnit.SECOND))
              .withSchedule(
                  SimpleScheduleBuilder.simpleSchedule()
                      .withMisfireHandlingInstructionFireNow()
                      .withRepeatCount(0))
              .build();

      if (scheduler.checkExists(jobKey)) {
        log.info(
            "SIP order verification job already exists for payment ID: {}. Adding new trigger.",
            paymentID);
        scheduler.scheduleJob(trigger);
      } else {
        JobDetail jobDetail =
            JobBuilder.newJob(SipOrderVerificationJob.class)
                .withIdentity(jobIdentity)
                .usingJobData("paymentID", paymentID)
                .storeDurably()
                .requestRecovery(true)
                .build();

        scheduler.scheduleJob(jobDetail, trigger);
      }
      log.info(
          "Scheduled SIP order verification job for payment ID: {} to run in 10 seconds",
          paymentID);

    } catch (Exception e) {
      log.warn(
          "Failed to schedule SIP order verification job for payment ID: {}. Error: {}",
          paymentID,
          e.getMessage());
    }
  }

  /**
   * Schedules a SipModificationTrackerJob to poll modification instruction statuses every 6 hours.
   *
   * @param modificationId The ID of the SipModification to track
   */
  public void scheduleModificationTrackerJob(Long modificationId) {
    try {
      String jobIdentity = "sip-modification-tracker-" + modificationId;
      JobKey jobKey = new JobKey(jobIdentity);

      org.quartz.CronTrigger trigger =
          TriggerBuilder.newTrigger()
              .withIdentity(jobIdentity + "-trigger")
              .forJob(jobKey)
              .startNow()
              .withSchedule(
                  org.quartz.CronScheduleBuilder.cronSchedule("0 0 */6 * * ?")
                      .withMisfireHandlingInstructionFireAndProceed())
              .build();

      if (!scheduler.checkExists(jobKey)) {
        JobDetail jobDetail =
            JobBuilder.newJob(com.nested.app.jobs.SipModificationTrackerJob.class)
                .withIdentity(jobIdentity)
                .usingJobData("sipModificationId", modificationId)
                .storeDurably()
                .requestRecovery(true)
                .build();
        scheduler.scheduleJob(jobDetail, trigger);
      } else {
        scheduler.scheduleJob(trigger);
      }

      log.info("Scheduled SipModificationTrackerJob for modificationId={}", modificationId);
    } catch (Exception e) {
      log.warn(
          "Failed to schedule SipModificationTrackerJob for modificationId={}: {}",
          modificationId,
          e.getMessage());
    }
  }

  /**
   * Immediately triggers a SipTransactionTracker job for the given orderRef. Intended for admin
   * debug use in production. If the job already exists, adds a new immediate trigger; otherwise
   * creates the job first. Returns false if no OrderItem is found for the given ref.
   */
  public boolean triggerSipTransactionTrackerNow(String orderRef) {
    var orderItems = orderItemsRepository.findByRef(orderRef);
    if (orderItems.isEmpty()) {
      log.warn("triggerSipTransactionTrackerNow: no OrderItem found for ref {}", orderRef);
      return false;
    }

    var orderItem = orderItems.getFirst();
    try {
      String jobIdentity = "sip-transaction-tracker-" + orderItem.getId();
      JobKey jobKey = new JobKey(jobIdentity);

      Trigger trigger =
          TriggerBuilder.newTrigger()
              .withIdentity(jobIdentity + "-trigger-admin-" + System.currentTimeMillis())
              .forJob(jobKey)
              .startNow()
              .withSchedule(
                  SimpleScheduleBuilder.simpleSchedule().withMisfireHandlingInstructionFireNow())
              .build();

      if (scheduler.checkExists(jobKey)) {
        scheduler.scheduleJob(trigger);
      } else {
        JobDetail jobDetail =
            JobBuilder.newJob(SipTransactionTracker.class)
                .withIdentity(jobIdentity)
                .usingJobData("orderRef", orderItem.getRef())
                .storeDurably()
                .requestRecovery(true)
                .build();
        scheduler.scheduleJob(jobDetail, trigger);
      }

      log.info(
          "Admin triggered SipTransactionTracker for orderRef={}, orderItemId={}",
          orderRef,
          orderItem.getId());
      return true;

    } catch (Exception e) {
      log.error(
          "Failed to admin-trigger SipTransactionTracker for orderRef={}: {}",
          orderRef,
          e.getMessage());
      return false;
    }
  }

  /**
   * Computes the next run date by adding one month to the current nextRunDate and clamping to the
   * last day of month if original target day exceeds month length.
   */
  LocalDate computeNextRunDate(SIPOrder order) {
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
