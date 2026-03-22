package com.nested.app.jobs;

import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.springframework.stereotype.Component;

/**
 * No-op stub retained so that any GoalSyncJob entries already persisted in the Quartz job store
 * do not cause ClassNotFoundException on startup or trigger execution.
 *
 * <p>Goal portfolio values (currentAmount, investedAmount, monthlySip) are now computed live in
 * GoalServiceImpl.convertToDTO() and no longer require a background sync job.
 */
@Slf4j
@Component
public class GoalSyncJob implements Job {

  @Override
  public void execute(JobExecutionContext context) {
    log.info("GoalSyncJob is a no-op — portfolio values are now computed live in GoalService.");
  }
}
