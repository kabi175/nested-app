package com.nested.app.services;

import com.nested.app.jobs.SellOrderFulfillmentJob;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.quartz.CronScheduleBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.springframework.beans.factory.annotation.Autowired;
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
public class SellOrderSchedulerService {

  @Autowired private Scheduler scheduler;

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
            .build();

    Trigger trigger =
        TriggerBuilder.newTrigger()
            .withIdentity("sell-order-check-trigger-" + orderRef)
            .forJob(jobDetail)
            .withSchedule(
                CronScheduleBuilder.cronSchedule("0 0 */6 * * ?") // every 6 hours
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
              .build();

      Trigger trigger =
          TriggerBuilder.newTrigger()
              .withIdentity("sell-order-check-trigger-" + orderRef)
              .forJob(jobDetail)
              .withSchedule(
                  CronScheduleBuilder.cronSchedule("0 0 */6 * * ?") // every 6 hours
                  )
              .startNow()
              .build();

      jobsAndTriggers.put(jobDetail, java.util.Collections.singleton(trigger));
    }

    // Schedule all jobs in batch
    scheduler.scheduleJobs(jobsAndTriggers, true);
    log.info("Successfully scheduled {} Sell Order Quartz jobs in batch", orderRefs.size());
  }
}
