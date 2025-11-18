package com.nested.app.config;

import com.nested.app.jobs.SipDueSchedulesJob;
import com.nested.app.jobs.SipRunningPollerJob;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.*;
import org.springframework.stereotype.Component;

/**
 * Initializes Quartz jobs for SIP lifecycle: - Daily due job at 05:00 server time promotes ACTIVE
 * orders to RUNNING. - Poller job every 5 minutes checks RUNNING orders for provider fills.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SipQuartzInitializer {

  private final Scheduler scheduler;

  @PostConstruct
  public void scheduleJobs() {
    try {
      scheduleDailyDueJob();
      schedulePollerJob();
    } catch (SchedulerException e) {
      log.error("Failed scheduling SIP Quartz jobs: {}", e.getMessage(), e);
    }
  }

  private void scheduleDailyDueJob() throws SchedulerException {
    // Cron expression: second minute hour day-of-month month day-of-week
    // "0 0 5 * * ?" => 05:00:00 every day
    // Uses SipOrderSchedulerService via SipDueSchedulesJob
    JobKey jobKey = JobKey.jobKey("sipDueSchedulesJob", "SIP");
    if (scheduler.checkExists(jobKey)) {
      return; // already scheduled
    }
    JobDetail jobDetail =
        JobBuilder.newJob(SipDueSchedulesJob.class)
            .withIdentity(jobKey)
            .withDescription("Runs SIP schedules that are due today")
            .build();

    // Cron: 05:00 every day
    Trigger trigger =
        TriggerBuilder.newTrigger()
            .withIdentity("sipDueSchedulesTrigger", "SIP")
            .withSchedule(CronScheduleBuilder.cronSchedule("0 0 5 * * ?"))
            .forJob(jobDetail)
            .build();

    scheduler.scheduleJob(jobDetail, trigger);
    log.info("Scheduled SipDueSchedulesJob at 05:00 daily.");
  }

  private void schedulePollerJob() throws SchedulerException {
    // "0 0/5 * * * ?" => every 5 minutes, at zero seconds
    JobKey jobKey = JobKey.jobKey("sipRunningPollerJob", "SIP");
    if (scheduler.checkExists(jobKey)) {
      return; // already scheduled
    }
    JobDetail jobDetail =
        JobBuilder.newJob(SipRunningPollerJob.class)
            .withIdentity(jobKey)
            .withDescription("Polls RUNNING SIP schedules for fills")
            .build();

    // Cron: every 5 minutes
    Trigger trigger =
        TriggerBuilder.newTrigger()
            .withIdentity("sipRunningPollerTrigger", "SIP")
            .withSchedule(CronScheduleBuilder.cronSchedule("0 0/5 * * * ?"))
            .forJob(jobDetail)
            .build();

    scheduler.scheduleJob(jobDetail, trigger);
    log.info("Scheduled SipRunningPollerJob every 5 minutes.");
  }
}
