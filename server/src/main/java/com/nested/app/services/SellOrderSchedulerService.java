package com.nested.app.services;

import com.nested.app.jobs.RedeemOrderTrackerJob;
import com.nested.app.jobs.SellOrderFulfillmentJob;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.CronScheduleBuilder;
import org.quartz.DateBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.springframework.stereotype.Service;

/**
 * Service for scheduling sell order fulfillment jobs using Quartz. Polls external API to check
 * order status and updates local state accordingly.
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Service
@AllArgsConstructor
public class SellOrderSchedulerService {
  private Scheduler scheduler;

  /**
   * Schedules a single sell order status check job
   *
   * @param orderRef External order reference
   * @throws SchedulerException if scheduling fails
   */
  public void scheduleSellOrderStatusJob(String orderRef) throws SchedulerException {
    JobDetail jobDetail =
        JobBuilder.newJob(SellOrderFulfillmentJob.class)
            .withIdentity("sell-order-check-" + orderRef)
            .usingJobData("orderRef", orderRef)
            .storeDurably()
            .requestRecovery(true)
            .build();

    Trigger trigger =
        TriggerBuilder.newTrigger()
            .withIdentity("sell-order-check-trigger-" + orderRef)
            .forJob(jobDetail)
            .withSchedule(
                CronScheduleBuilder.cronSchedule("0 0 */6 * * ?")
                    .withMisfireHandlingInstructionFireAndProceed() // every 6
                // hours
                )
            .startNow()
            .build();

    scheduler.scheduleJob(jobDetail, trigger);
    log.info("Scheduled Quartz job for Sell Order {}", orderRef);
  }

  /**
   * Schedules status check jobs for multiple sell orders in batch. This is more efficient than
   * scheduling jobs one by one.
   *
   * @param orderRefs List of order references to schedule jobs for
   * @throws SchedulerException if scheduling fails
   */
  public void scheduleSellOrderStatusJobs(List<String> orderRefs) throws SchedulerException {
    if (orderRefs == null || orderRefs.isEmpty()) {
      log.warn("No order references provided for batch scheduling");
      return;
    }

    log.info("Batch scheduling status check jobs for {} sell orders", orderRefs.size());

    Map<JobDetail, java.util.Set<? extends Trigger>> jobsAndTriggers = new HashMap<>();

    for (String orderRef : orderRefs) {
      JobDetail jobDetail =
          JobBuilder.newJob(SellOrderFulfillmentJob.class)
              .withIdentity("sell-order-check-" + orderRef)
              .usingJobData("orderRef", orderRef)
              .storeDurably()
              .requestRecovery(true)
              .build();

      Trigger trigger =
          TriggerBuilder.newTrigger()
              .withIdentity("sell-order-check-trigger-" + orderRef)
              .forJob(jobDetail)
              .withSchedule(
                  CronScheduleBuilder.cronSchedule("0 0 */6 * * ?")
                      .withMisfireHandlingInstructionFireAndProceed() // every
                  // 6 hours
                  )
              .startNow()
              .build();

      jobsAndTriggers.put(jobDetail, java.util.Collections.singleton(trigger));
    }

    // Schedule all jobs in batch
    scheduler.scheduleJobs(jobsAndTriggers, true);
    log.info("Successfully scheduled {} Sell Order Quartz jobs in batch", orderRefs.size());
  }

  /**
   * Schedules redeem order tracker job with multiple trigger intervals: - First check after 5
   * seconds - Second check after 10 minutes - Recurring checks every 6 hours thereafter
   *
   * @param orderRef External order reference
   * @throws SchedulerException if scheduling fails
   */
  public void scheduleRedeemOrderTrackerJob(String orderRef) throws SchedulerException {
    log.info("Scheduling RedeemOrderTrackerJob for order ref: {}", orderRef);

    JobDetail jobDetail =
        JobBuilder.newJob(RedeemOrderTrackerJob.class)
            .withIdentity("redeem-order-tracker-" + orderRef)
            .usingJobData("orderId", orderRef)
            .storeDurably()
            .requestRecovery(true)
            .build();

    Set<Trigger> triggers = new HashSet<>();

    // Trigger 1: After 5 seconds
    Trigger trigger5s =
        TriggerBuilder.newTrigger()
            .withIdentity("redeem-order-tracker-5s-" + orderRef)
            .forJob(jobDetail)
            .startAt(DateBuilder.futureDate(5, DateBuilder.IntervalUnit.SECOND))
            .withSchedule(
                SimpleScheduleBuilder.simpleSchedule()
                    .withRepeatCount(0)
                    .withMisfireHandlingInstructionFireNow())
            .build();
    triggers.add(trigger5s);

    // Trigger 2: After 10 minutes
    Trigger trigger10m =
        TriggerBuilder.newTrigger()
            .withIdentity("redeem-order-tracker-10m-" + orderRef)
            .forJob(jobDetail)
            .startAt(DateBuilder.futureDate(10, DateBuilder.IntervalUnit.MINUTE))
            .withSchedule(
                SimpleScheduleBuilder.simpleSchedule()
                    .withRepeatCount(0)
                    .withMisfireHandlingInstructionFireNow())
            .build();
    triggers.add(trigger10m);

    // Trigger 3: Every 6 hours recurring
    Trigger trigger6h =
        TriggerBuilder.newTrigger()
            .withIdentity("redeem-order-tracker-6h-" + orderRef)
            .forJob(jobDetail)
            .withSchedule(
                CronScheduleBuilder.cronSchedule("0 0 */6 * * ?")
                    .withMisfireHandlingInstructionFireAndProceed())
            .startNow()
            .build();
    triggers.add(trigger6h);

    // Schedule job with all triggers
    scheduler.scheduleJob(jobDetail, triggers, true);
    log.info(
        "Successfully scheduled RedeemOrderTrackerJob for order ref: {} with 3 triggers (5s, 10m, 6h)",
        orderRef);
  }
}
