package com.nested.app.services;

import com.nested.app.jobs.PreVerificationPollerJob;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.DateBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.TriggerKey;
import org.springframework.stereotype.Service;

/**
 * Service for scheduling Quartz jobs dynamically. Provides methods to schedule PreVerification
 * polling jobs for users.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class QuartzJobSchedulerService {

  private final Scheduler scheduler;

  /**
   * Schedules a PreVerification polling job for a specific user. The job will run every 5 minutes
   * until the verification is complete (refresh returns true).
   *
   * @param userId the ID of the user to schedule verification polling for
   * @throws SchedulerException if scheduling fails
   */
  public void schedulePreVerificationPollingJob(Long userId) throws SchedulerException {
    String jobName = "PreVerificationPollerJob-" + userId;
    String jobGroup = "pre-verification-group";

    // Create job detail
    JobDetail jobDetail =
        JobBuilder.newJob(PreVerificationPollerJob.class)
            .withIdentity(jobName, jobGroup)
            .usingJobData("userId", userId)
            .requestRecovery(true)
            .build();

    // Create trigger to run every 5 minutes
    Trigger trigger =
        TriggerBuilder.newTrigger()
            .withIdentity(jobName + "-trigger", jobGroup)
            .startAt(DateBuilder.futureDate(3, DateBuilder.IntervalUnit.SECOND))
            // 3 seconds delay
            .withSchedule(
                SimpleScheduleBuilder.simpleSchedule()
                    .withIntervalInMinutes(5)
                    .repeatForever()
                    .withMisfireHandlingInstructionFireNow())
            .build();

    // Schedule the job
    scheduler.scheduleJob(jobDetail, trigger);

    log.info("Scheduled PreVerification polling job for user {}", userId);
  }

  /**
   * Unschedules a PreVerification polling job for a specific user.
   *
   * @param userId the ID of the user to unschedule
   * @throws SchedulerException if unscheduling fails
   */
  public void unschedulePreVerificationPollingJob(Long userId) throws SchedulerException {
    String jobName = "PreVerificationPollerJob-" + userId;
    String jobGroup = "pre-verification-group";

    TriggerKey triggerKey = new TriggerKey(jobName + "-trigger", jobGroup);
    scheduler.unscheduleJob(triggerKey);

    log.info("Unscheduled PreVerification polling job for user {}", userId);
  }
}
