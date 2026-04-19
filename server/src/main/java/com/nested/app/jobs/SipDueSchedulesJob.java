package com.nested.app.jobs;

import com.nested.app.services.SipOrderSchedulerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.DisallowConcurrentExecution;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Dispatches due ACTIVE SIPOrders to RUNNING state each day at 05:00. */
@Slf4j
@Component
@RequiredArgsConstructor
@DisallowConcurrentExecution
public class SipDueSchedulesJob {
  private final SipOrderSchedulerService sipOrderSchedulerService;

  // runs 05:00:00 every day — after SipCycleReconcilerJob at 04:50
  @Scheduled(cron = "0 0 5 * * ?")
  public void execute() {
    try {
      sipOrderSchedulerService.dispatchDueOrders();
    } catch (Exception e) {
      log.error("Error executing SipDueSchedulesJob: {}", e.getMessage(), e);
    }
  }
}
