package com.nested.app.services;

import com.nested.app.entity.OrderItems;
import com.nested.app.entity.SIPOrder;
import com.nested.app.enums.TransactionStatus;
import com.nested.app.jobs.SipOrderVerificationJob;
import com.nested.app.jobs.SipTransactionTracker;
import com.nested.app.repository.OrderItemsRepository;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.springframework.data.domain.Pageable;
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
  private final OrderItemsRepository orderItemsRepository;
  private final Scheduler scheduler;

  private static final int BATCH_SIZE = 50;
  private static final int MAX_BATCHES = 100; // Safety limit to prevent infinite loops

  /**
   * Scan for due SIPOrders (scheduleStatus=ACTIVE) and mark them RUNNING with a generated orderRef.
   * The due logic relies on SIPOrder#due(LocalDate) which compares nextRunDate vs today.
   *
   * <p>Processes items in batches to handle large datasets efficiently while avoiding
   * memory issues and providing better observability.
   */
  @Transactional
  public void runDueOrders() {
    int pageNumber = 0;
    int totalProcessed = 0;
    int totalFailed = 0;

    log.info("Starting bulk processing of due SIP orders");

    while (pageNumber < MAX_BATCHES) {
      var page = orderItemsRepository.findAllSipOrderItems(
          List.of(TransactionStatus.ACTIVE.name()),
          Pageable.ofSize(BATCH_SIZE).withPage(pageNumber));

      if (page.isEmpty()) {
        break;
      }

      log.debug("Processing batch {} with {} items (total elements: {})",
          pageNumber + 1, page.getNumberOfElements(), page.getTotalElements());

      for (var orderItem : page.getContent()) {
        try {
          scheduleSipTransactionTrackerJob(orderItem);
          totalProcessed++;
        } catch (Exception e) {
          totalFailed++;
          log.error(
              "Failed to schedule SipTransactionTracker for orderItem id={}: {}",
              orderItem.getId(),
              e.getMessage(),
              e);
        }
      }

      if (!page.hasNext()) {
        break;
      }
      pageNumber++;
    }

    if (pageNumber >= MAX_BATCHES) {
      log.warn("Reached maximum batch limit ({}). Some items may not have been processed.", MAX_BATCHES);
    }

    log.info("Completed bulk processing of due SIP orders. Processed: {}, Failed: {}, Batches: {}",
        totalProcessed, totalFailed, pageNumber + 1);
  }

  /**
   * Schedules a SipTransactionTracker job for an individual OrderItem. The job will track the SIP
   * transaction status by polling the provider.
   *
   * @param orderItem The OrderItem to track
   */
  public void scheduleSipTransactionTrackerJob(OrderItems orderItem) {
    if (orderItem.getRef() == null || orderItem.getRef().isEmpty()) {
      log.warn(
          "OrderItem id={} has no ref, skipping SipTransactionTracker scheduling",
          orderItem.getId());
      return;
    }

    try {
      String jobIdentity = "sip-transaction-tracker-" + orderItem.getId();

      JobDetail jobDetail =
          JobBuilder.newJob(SipTransactionTracker.class)
              .withIdentity(jobIdentity)
              .usingJobData("orderRef", orderItem.getRef())
              .storeDurably()
              .requestRecovery(true)
              .build();

      Trigger trigger =
          TriggerBuilder.newTrigger()
              .withIdentity(jobIdentity + "-trigger")
              .forJob(jobDetail)
              .withSchedule(
                  SimpleScheduleBuilder.simpleSchedule()
                      .withIntervalInHours(6)
                      .withMisfireHandlingInstructionFireNow()
                      .repeatForever())
              .startNow()
              .build();

      scheduler.scheduleJob(jobDetail, trigger);
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
