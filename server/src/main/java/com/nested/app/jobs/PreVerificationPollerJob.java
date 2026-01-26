package com.nested.app.jobs;

import com.nested.app.services.PreVerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;

/**
 * Quartz job that polls PreVerificationService.refresh every 5 minutes until it returns true. The
 * user ID is passed via the JobDataMap in the JobExecutionContext.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PreVerificationPollerJob implements Job {
  private final PreVerificationService preVerificationService;

  @Override
  public void execute(JobExecutionContext context) throws JobExecutionException {
    try {
      Long userId = context.getJobDetail().getJobDataMap().getLong("userId");

      log.info("Executing PreVerificationPollerJob for user: {}", userId);

      // Poll the verification status
      boolean completed = preVerificationService.refresh(null, userId);

      if (completed) {
        log.info("Verification completed for user {}. Unscheduling the job.", userId);
        // Remove this job from the scheduler since verification is complete
        context.getScheduler().deleteJob(context.getJobDetail().getKey());
      } else {
        log.debug("Verification still pending for user {}. Will retry in 5 minutes.", userId);
      }
    } catch (Exception e) {
      log.error("Error executing PreVerificationPollerJob: {}", e.getMessage(), e);
      throw new JobExecutionException("PreVerificationPollerJob failed", e);
    }
  }
}
