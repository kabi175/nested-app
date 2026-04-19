package com.nested.app.jobs;

import com.nested.app.services.SipCycleReconcilerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Advances stuck RUNNING SIPOrders daily at 04:50, 10 minutes before the dispatcher job. */
@Slf4j
@Component
@RequiredArgsConstructor
public class SipCycleReconcilerJob {
  private final SipCycleReconcilerService sipCycleReconcilerService;

  // runs 02:00:00 every day — before SipDueSchedulesJob at 05:00
  @Scheduled(cron = "0 0 2 * * ?")
  public void execute() {
    try {
      log.info("Executing SipCycleReconcilerJob");
      sipCycleReconcilerService.advanceStuckCycles();
      log.info("SipCycleReconcilerJob completed");
    } catch (Exception e) {
      log.error("Error executing SipCycleReconcilerJob: {}", e.getMessage(), e);
    }
  }
}
