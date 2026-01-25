package com.nested.app.listeners;

import com.nested.app.events.GoalSyncEvent;
import com.nested.app.jobs.GoalSyncJob;
import java.util.Date;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobBuilder;
import org.quartz.JobDetail;
import org.quartz.JobKey;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.TriggerKey;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Listener that schedules GoalSyncJob with a 5-second delay when GoalSyncEvent is published. Uses
 * TransactionalEventListener to ensure job is scheduled only after transaction commits, avoiding
 * reads of uncommitted data. Supports rescheduling - if multiple events fire for the same goal in
 * quick succession, the job is rescheduled to 5 seconds from the latest event.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GoalSyncListener {

  private static final String JOB_GROUP = "DEFAULT";
  private static final long DELAY_MS = 10000; // 10 seconds delay

  private final Scheduler scheduler;

  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void on(GoalSyncEvent event) {
    Long goalId = event.goalId();
    Long userId = event.user().getId();

    log.info("Received GoalSyncEvent for goalId={}, userId={}", goalId, userId);

    try {
      String jobName = "GoalSyncJob-" + goalId;
      JobKey jobKey = new JobKey(jobName, JOB_GROUP);
      TriggerKey triggerKey = new TriggerKey(jobName + "-trigger", JOB_GROUP);

      Date startTime = new Date(System.currentTimeMillis() + DELAY_MS);

      if (scheduler.checkExists(jobKey)) {
        // Reschedule existing job with new 5-second delay
        Trigger newTrigger =
            TriggerBuilder.newTrigger()
                .withIdentity(triggerKey)
                .forJob(jobKey)
                .startAt(startTime)
                .withSchedule(SimpleScheduleBuilder.simpleSchedule().withRepeatCount(0))
                .build();

        scheduler.rescheduleJob(triggerKey, newTrigger);
        log.info("Rescheduled GoalSyncJob for goalId={} to run at {}", goalId, startTime);
      } else {
        // Create new job and trigger
        JobDetail jobDetail =
            JobBuilder.newJob(GoalSyncJob.class)
                .withIdentity(jobKey)
                .usingJobData("goalId", goalId)
                .usingJobData("userId", userId)
                .storeDurably()
                .requestRecovery(true)
                .build();

        Trigger trigger =
            TriggerBuilder.newTrigger()
                .withIdentity(triggerKey)
                .forJob(jobDetail)
                .startAt(startTime)
                .withSchedule(
                    SimpleScheduleBuilder.simpleSchedule()
                        .withMisfireHandlingInstructionFireNow()
                        .withRepeatCount(0))
                .build();

        scheduler.scheduleJob(jobDetail, trigger);
        log.info("Scheduled new GoalSyncJob for goalId={} to run at {}", goalId, startTime);
      }
    } catch (SchedulerException e) {
      log.error("Failed to schedule GoalSyncJob for goalId={}, userId={}", goalId, userId, e);
    }
  }
}
