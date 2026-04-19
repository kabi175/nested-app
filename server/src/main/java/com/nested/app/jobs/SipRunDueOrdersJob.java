package com.nested.app.jobs;

import com.nested.app.services.SipOrderSchedulerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.springframework.stereotype.Component;

/**
 * Quartz job that triggers a SIP due-order run after a delay. Scheduled after SIP order payment
 * verification to immediately process newly-activated SIP orders.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@DisallowConcurrentExecution
public class SipRunDueOrdersJob implements Job {
  private final SipOrderSchedulerService sipOrderSchedulerService;

  @Override
  public void execute(JobExecutionContext context) throws JobExecutionException {
    try {
      log.info("Executing SipRunDueOrdersJob - running due SIP orders");
      sipOrderSchedulerService.dispatchDueOrders();
      log.info("SipRunDueOrdersJob completed successfully");
    } catch (Exception e) {
      log.error("Error executing SipRunDueOrdersJob: {}", e.getMessage(), e);
      throw new JobExecutionException(e);
    }
  }
}
