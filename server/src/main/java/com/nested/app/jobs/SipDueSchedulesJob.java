package com.nested.app.jobs;

import com.nested.app.services.SipOrderSchedulerService;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/** Quartz job that promotes due ACTIVE SIPOrders to RUNNING state each day. */
@Slf4j
@Component
public class SipDueSchedulesJob implements Job {
  @Autowired private SipOrderSchedulerService sipOrderSchedulerService;

  @Override
  public void execute(JobExecutionContext context) {
    try {
      sipOrderSchedulerService.runDueOrders();
    } catch (Exception e) {
      log.error("Error executing SipDueSchedulesJob: {}", e.getMessage(), e);
    }
  }
}
