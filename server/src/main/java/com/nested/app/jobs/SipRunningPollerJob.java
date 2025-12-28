package com.nested.app.jobs;

import com.nested.app.services.SipOrderSchedulerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.DisallowConcurrentExecution;
import org.quartz.JobExecutionException;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Quartz job running at a frequent interval to poll RUNNING SIPOrders for provider fills. */
@Slf4j
@Component
@RequiredArgsConstructor
@DisallowConcurrentExecution
public class SipRunningPollerJob {
  private final SipOrderSchedulerService sipOrderSchedulerService;

  // runs every 5 minutes, at zero seconds
  @Scheduled(fixedDelayString = "5m")
  public void execute() throws JobExecutionException {
    try {
      sipOrderSchedulerService.pollRunningOrders();
    } catch (Exception e) {
      log.error("Error executing SipRunningPollerJob: {}", e.getMessage(), e);
      throw new JobExecutionException(e);
    }
  }
}
