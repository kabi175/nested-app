package com.nested.app.services;

import com.nested.app.jobs.LumpSumPaymentPollerJob;
import com.nested.app.jobs.MandateProcessPollerJob;
import com.nested.app.jobs.PreVerificationPollerJob;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.DateBuilder;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.JobKey;
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
    String randomId = UUID.randomUUID().toString().substring(0, 8);
    String jobName = "PreVerificationPollerJob-" + userId + "-" + randomId;
    String jobGroup = "pre-verification-group";

    // Create job detail
    JobDetail jobDetail =
        JobBuilder.newJob(PreVerificationPollerJob.class)
            .withIdentity(jobName, jobGroup)
            .usingJobData("userId", userId)
            .requestRecovery(true)
            .build();

    // Create trigger to run every 10s for 10min
    Trigger trigger =
        TriggerBuilder.newTrigger()
            .withIdentity(jobName + "-trigger", jobGroup)
            .startAt(DateBuilder.futureDate(3, DateBuilder.IntervalUnit.SECOND))
            // 3 seconds delay
            .withSchedule(
                SimpleScheduleBuilder.simpleSchedule()
                    .withIntervalInSeconds(10)
                    .withRepeatCount(60)
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

  /**
   * Schedules a LumpSumPaymentPoller job for a specific payment reference. The job will run every
   * 10 seconds for up to 10 minutes, publishing LumpSumPaymentCompletedEvent. The job terminates
   * early if the payment's buyStatus is no longer SUBMITTED.
   *
   * @param paymentRef the payment reference to poll
   * @throws SchedulerException if scheduling fails
   */
  public void scheduleLumpSumPaymentPollerJob(String paymentRef) throws SchedulerException {
    String jobName = "LumpSumPaymentPollerJob-" + paymentRef;
    String jobGroup = "lumpsum-payment-poller-group";

    // Create job detail
    JobDetail jobDetail =
        JobBuilder.newJob(LumpSumPaymentPollerJob.class)
            .withIdentity(jobName, jobGroup)
            .usingJobData("paymentRef", paymentRef)
            .usingJobData("startTime", System.currentTimeMillis())
            .requestRecovery(true)
            .build();

    // Create trigger to run every 10 seconds
    Trigger trigger =
        TriggerBuilder.newTrigger()
            .withIdentity(jobName + "-trigger", jobGroup)
            .startNow()
            .withSchedule(
                SimpleScheduleBuilder.simpleSchedule()
                    .withIntervalInSeconds(10)
                    .withRepeatCount(60)
                    .withMisfireHandlingInstructionFireNow())
            .build();

    // Schedule the job
    scheduler.scheduleJob(jobDetail, trigger);

    log.info("Scheduled LumpSumPaymentPoller job for payment ref: {}", paymentRef);
  }

  /**
   * Schedules a MandateProcessPoller job for a specific payment and mandate. The job will run every
   * 10 seconds for up to 10 minutes (60 executions), publishing MandateProcessEvent. The job
   * terminates early if the payment's sipStatus is no longer SUBMITTED.
   *
   * @param paymentID the payment ID to poll
   * @param mandateID the mandate ID associated with the payment
   * @throws SchedulerException if scheduling fails
   */
  public void scheduleMandatePollingJob(Long paymentID, Long mandateID) throws SchedulerException {
    String jobName = "MandateProcessPollerJob-" + paymentID;
    String jobGroup = "mandate-process-poller-group";

    // Create job detail
    JobDetail jobDetail =
        JobBuilder.newJob(MandateProcessPollerJob.class)
            .withIdentity(jobName, jobGroup)
            .usingJobData("paymentID", paymentID)
            .usingJobData("startTime", System.currentTimeMillis())
            .requestRecovery(true)
            .build();

    // Create trigger to run every 10 seconds for 10 minutes (59 repeats = 60 total executions)
    Trigger trigger =
        TriggerBuilder.newTrigger()
            .withIdentity(jobName + "-trigger", jobGroup)
            .startNow()
            .withSchedule(
                SimpleScheduleBuilder.simpleSchedule()
                    .withIntervalInSeconds(10)
                    .withRepeatCount(59)
                    .withMisfireHandlingInstructionFireNow())
            .build();

    // Schedule the job
    scheduler.scheduleJob(jobDetail, trigger);

    log.info(
        "Scheduled MandateProcessPoller job for payment ID: {}, mandate ID: {}",
        paymentID,
        mandateID);
  }

  /**
   * Cancels a MandateProcessPoller job for a specific payment.
   *
   * @param paymentID the payment ID whose polling job should be cancelled
   * @throws SchedulerException if cancellation fails
   */
  public void cancelMandatePollingJob(Long paymentID) throws SchedulerException {
    String jobName = "MandateProcessPollerJob-" + paymentID;
    String jobGroup = "mandate-process-poller-group";

    JobKey jobKey = new JobKey(jobName, jobGroup);
    boolean deleted = scheduler.deleteJob(jobKey);

    if (deleted) {
      log.info("Cancelled MandateProcessPoller job for payment ID: {}", paymentID);
    } else {
      log.debug(
          "MandateProcessPoller job for payment ID: {} was not found or already completed",
          paymentID);
    }
  }
}
