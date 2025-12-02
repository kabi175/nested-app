package com.nested.app.jobs;

import com.nested.app.services.SipOrderSchedulerService;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Quartz job running at a frequent interval to poll RUNNING SIPOrders for provider fills. */
@Slf4j
@Component
public class SipRunningPollerJob {
  @Autowired private SipOrderSchedulerService sipOrderSchedulerService;

  // runs every 5 minutes, at zero seconds
  @Scheduled(cron = "0 0/5 * * * ?")
  public void execute() throws JobExecutionException {
    try {
      sipOrderSchedulerService.pollRunningOrders();
    } catch (Exception e) {
      log.error("Error executing SipRunningPollerJob: {}", e.getMessage(), e);
      throw new JobExecutionException(e);
    }
  }
}
