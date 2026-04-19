package com.nested.app.services;

import com.nested.app.entity.OrderItems;
import com.nested.app.entity.SIPOrder;
import com.nested.app.entity.SIPOrder.ScheduleStatus;
import com.nested.app.jobs.SipOrderVerificationJob;
import com.nested.app.jobs.SipRunDueOrdersJob;
import com.nested.app.jobs.SipTransactionTracker;
import com.nested.app.repository.OrderItemsRepository;
import com.nested.app.repository.SIPOrderRepository;
import java.time.LocalDate;
import java.util.ArrayList;
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
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/**
 * Dispatches due SIPOrders to RUNNING state and schedules a SipTransactionTracker job per
 * OrderItem. Cycle advancement (stuck-order reconciliation) is handled separately by
 * SipCycleReconcilerService.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SipOrderSchedulerService {
  private final SIPOrderRepository sipOrderRepository;
  private final OrderItemsRepository orderItemsRepository;
  private final Scheduler scheduler;

  /**
   * Finds ACTIVE SIPOrders with nextRunDate <= today, marks them RUNNING, and — after the
   * transaction commits — schedules a SipTransactionTracker job per OrderItem. Called daily at
   * 05:00 by SipDueSchedulesJob and on-demand by SipRunDueOrdersJob after payment verification.
   */
  @Transactional
  public void dispatchDueOrders() {
    LocalDate today = LocalDate.now();
    log.info("Starting SIP order dispatch for date {}", today);

    List<OrderItems> dueItems = transitionDueOrdersToRunning(today);

    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
      @Override
      public void afterCommit() {
        scheduleTrackerJobs(dueItems);
      }
    });

    log.info("Completed SIP order dispatch for date {}", today);
  }

  private List<OrderItems> transitionDueOrdersToRunning(LocalDate today) {
    List<SIPOrder> dueSips =
        sipOrderRepository.findByScheduleStatusAndNextRunDateLessThanEqual(
            ScheduleStatus.ACTIVE, today);
    log.debug("Dispatch: {} due SIP orders for date {}", dueSips.size(), today);

    List<OrderItems> dueItems = new ArrayList<>();
    for (SIPOrder sip : dueSips) {
      sip.setScheduleStatus(ScheduleStatus.RUNNING);
      dueItems.addAll(sip.getItems());
    }

    sipOrderRepository.saveAll(dueSips);
    log.info("Dispatch: {} SIPOrders → RUNNING, {} OrderItems queued for tracking",
        dueSips.size(), dueItems.size());
    return dueItems;
  }

  private void scheduleTrackerJobs(List<OrderItems> items) {
    int success = 0, failed = 0;
    for (int i = 0; i < items.size(); i++) {
      try {
        scheduleSipTransactionTrackerJob(items.get(i), i);
        success++;
      } catch (Exception e) {
        failed++;
        log.error("Failed to schedule tracker for orderItem id={}: {}",
            items.get(i).getId(), e.getMessage(), e);
      }
    }
    log.info("Scheduled {} tracker jobs ({} failed)", success, failed);
  }

  /**
   * Schedules a SipTransactionTracker job for an individual OrderItem.
   *
   * @param orderItem The OrderItem to track
   * @param index     Stagger index to avoid thundering-herd on the provider
   */
  public void scheduleSipTransactionTrackerJob(OrderItems orderItem, int index) {
    if (orderItem.getRef() == null || orderItem.getRef().isEmpty()) {
      log.warn("OrderItem id={} has no ref, skipping SipTransactionTracker scheduling",
          orderItem.getId());
      return;
    }

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

    try {
      if (scheduler.checkExists(jobKey)) {
        log.info("SipTransactionTracker job already exists for orderItem id={}. Adding new trigger.",
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
      log.info("Scheduled SipTransactionTracker for orderItem id={}, ref={}",
          orderItem.getId(), orderItem.getRef());
    } catch (Exception e) {
      throw new RuntimeException(
          "Failed to schedule SipTransactionTracker for orderItem id=" + orderItem.getId(), e);
    }
  }

  /**
   * Schedules a SipRunDueOrdersJob to run 30 seconds after this method is called. Used after SIP
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
      log.info("Scheduled SipRunDueOrdersJob to run in 30 seconds");
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
        log.info("SIP order verification job already exists for payment ID: {}. Adding new trigger.",
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
      log.info("Scheduled SIP order verification job for payment ID: {} to run in 10 seconds",
          paymentID);

    } catch (Exception e) {
      log.warn("Failed to schedule SIP order verification job for payment ID: {}. Error: {}",
          paymentID, e.getMessage());
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
      log.warn("Failed to schedule SipModificationTrackerJob for modificationId={}: {}",
          modificationId, e.getMessage());
    }
  }

  /**
   * Immediately triggers a SipTransactionTracker job for the given orderRef. Intended for admin
   * debug use. Returns false if no OrderItem is found for the given ref.
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

      log.info("Admin triggered SipTransactionTracker for orderRef={}, orderItemId={}",
          orderRef, orderItem.getId());
      return true;

    } catch (Exception e) {
      log.error("Failed to admin-trigger SipTransactionTracker for orderRef={}: {}",
          orderRef, e.getMessage());
      return false;
    }
  }
}
