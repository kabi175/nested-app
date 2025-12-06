package com.nested.app.services;

import com.nested.app.jobs.BuyOrderFulfillmentJob;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.quartz.CronScheduleBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class OrderSchedulerService {

  @Autowired private Scheduler scheduler;

  /**
   * Schedules status check jobs for multiple orders in batch. This is more efficient than
   * scheduling jobs one by one.
   *
   * @param orderIds List of order IDs to schedule jobs for
   * @throws SchedulerException if scheduling fails
   */
  public void scheduleOrderStatusJobs(List<String> orderIds) throws SchedulerException {
    if (orderIds == null || orderIds.isEmpty()) {
      log.warn("No order IDs provided for batch scheduling");
      return;
    }

    log.info("Batch scheduling status check jobs for {} orders", orderIds.size());

    Map<JobDetail, java.util.Set<? extends Trigger>> jobsAndTriggers = new HashMap<>();

    for (String orderId : orderIds) {
      JobDetail jobDetail =
          JobBuilder.newJob(BuyOrderFulfillmentJob.class)
              .withIdentity("order-check-" + orderId)
              .usingJobData("orderId", orderId)
              .storeDurably()
              .build();

      Trigger trigger =
          TriggerBuilder.newTrigger()
              .withIdentity("order-check-trigger-" + orderId)
              .forJob(jobDetail)
              .withSchedule(
                  CronScheduleBuilder.cronSchedule("0 0 */6 * * ?") // every 6 hours
                  )
              .startNow()
              .build();

      jobsAndTriggers.put(jobDetail, java.util.Set.of(trigger));
    }

    // Schedule all jobs in batch
    scheduler.scheduleJobs(jobsAndTriggers, true);
    log.info("Successfully scheduled {} Quartz jobs in batch", orderIds.size());
  }

  public void scheduleInstantOrderStatusJobs(List<String> orderIds) throws SchedulerException {
    if (orderIds == null || orderIds.isEmpty()) {
      log.warn("No order IDs provided for batch scheduling");
      return;
    }

    log.info("Batch scheduling status check jobs for {} orders", orderIds.size());

    Map<JobDetail, java.util.Set<? extends Trigger>> jobsAndTriggers = new HashMap<>();

    for (String orderId : orderIds) {
      JobDetail jobDetail =
          JobBuilder.newJob(BuyOrderFulfillmentJob.class)
              .withIdentity("order-check-instant-" + orderId)
              .usingJobData("orderId", orderId)
              .storeDurably()
              .build();

      // Add a second trigger that runs after 5 seconds delay
      Trigger immediateCheckTrigger =
          TriggerBuilder.newTrigger()
              .withIdentity("order-immediate-check-trigger-" + orderId)
              .forJob(jobDetail)
              .startAt(new java.util.Date(System.currentTimeMillis() + 5000)) // 5 seconds delay
              .withSchedule(
                  SimpleScheduleBuilder.simpleSchedule()
                      .withRepeatCount(0)) // ensures it's persisted
              .build();

      jobsAndTriggers.put(jobDetail, java.util.Set.of(immediateCheckTrigger));
    }

    // Schedule all jobs in batch
    scheduler.scheduleJobs(jobsAndTriggers, true);
    log.info("Successfully scheduled {} Quartz jobs in batch", orderIds.size());
  }
}
