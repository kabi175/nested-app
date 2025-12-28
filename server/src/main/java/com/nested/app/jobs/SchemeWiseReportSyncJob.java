package com.nested.app.jobs;

import com.nested.app.services.SchemeWiseReportService;
import com.nested.app.services.SchemeWiseReportService.ReportFetchSummary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.DisallowConcurrentExecution;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled job that fetches scheme-wise reports for all investors daily. Runs once per day and
 * processes up to 50 investors in parallel.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@DisallowConcurrentExecution
public class SchemeWiseReportSyncJob {

  private final SchemeWiseReportService schemeWiseReportService;

  /**
   * Executes daily at 2:00 AM to fetch scheme-wise reports for all investors. Cron expression: "0 0
   * 2 * * ?" = Every day at 2:00:00 AM
   */
  @Scheduled(cron = "0 0 2 * * ?")
  public void execute() {
    log.info("Starting SchemeWiseReportSyncJob execution");
    long startTime = System.currentTimeMillis();

    try {
      ReportFetchSummary summary = schemeWiseReportService.fetchReportsForAllInvestors();

      long duration = System.currentTimeMillis() - startTime;

      if (summary.hasFailures()) {
        log.warn(
            "SchemeWiseReportSyncJob completed with some failures. "
                + "Total: {}, Success: {}, Failures: {}, Success Rate: {}%, Duration: {}ms",
            summary.totalProcessed(),
            summary.successCount(),
            summary.failureCount(),
            String.format("%.2f", summary.successRate()),
            duration);
      } else {
        log.info(
            "SchemeWiseReportSyncJob completed successfully. "
                + "Total: {}, Success: {}, Duration: {}ms",
            summary.totalProcessed(),
            summary.successCount(),
            duration);
      }
    } catch (Exception e) {
      long duration = System.currentTimeMillis() - startTime;
      log.error(
          "Error executing SchemeWiseReportSyncJob after {}ms: {}", duration, e.getMessage(), e);
    }
  }
}
