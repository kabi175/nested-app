package com.nested.app.jobs;

import com.nested.app.services.SipOrderSchedulerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Quartz job that promotes due ACTIVE SIPOrders to RUNNING state each day. */
@Slf4j
@Component
@RequiredArgsConstructor
public class SipDueSchedulesJob {
  private final SipOrderSchedulerService sipOrderSchedulerService;

  // runs  05:00:00 every day
  @Scheduled(cron = "0 0 5 * * ?")
  public void execute() {
    try {
      sipOrderSchedulerService.runDueOrders();
    } catch (Exception e) {
      log.error("Error executing SipDueSchedulesJob: {}", e.getMessage(), e);
    }
  }
}
