package com.nested.app.jobs;

import com.nested.app.services.SipOrderSchedulerService;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/** Quartz job running at a frequent interval to poll RUNNING SIPOrders for provider fills. */
@Slf4j
@Component
public class SipRunningPollerJob implements Job {
  @Autowired private SipOrderSchedulerService sipOrderSchedulerService;

  @Override
  public void execute(JobExecutionContext context) {
    try {
      sipOrderSchedulerService.pollRunningOrders();
    } catch (Exception e) {
      log.error("Error executing SipRunningPollerJob: {}", e.getMessage(), e);
    }
  }
}
