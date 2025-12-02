package com.nested.app.jobs;

import com.nested.app.repository.JobHistoryRepository;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobExecutionException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Quartz job that periodically cleans up old job history records based on the configured retention
 * policy. Deletes records older than the configured retention period to prevent unbounded database
 * growth.
 */
@Slf4j
@Component
public class JobHistoryCleanupJob {

  @Autowired private JobHistoryRepository jobHistoryRepository;

  @Value("${job.history.retention.days:30}")
  private int retentionDays;

  // Cron expression for job history cleanup (daily at 2 AM)
  @Scheduled(cron = "0 0 2 * * ?")
  public void execute() throws JobExecutionException {

    try {
      log.info("Starting job history cleanup with retention period of {} days", retentionDays);

      Timestamp cutoffTimestamp =
          Timestamp.from(Instant.now().minus(retentionDays, ChronoUnit.DAYS));

      int deletedCount = jobHistoryRepository.deleteByStartTimeBefore(cutoffTimestamp);

      log.info(
          "Job history cleanup completed. Deleted {} records older than {}",
          deletedCount,
          cutoffTimestamp);

    } catch (Exception e) {
      log.error("Error during job history cleanup: {}", e.getMessage(), e);
      throw new JobExecutionException("Job history cleanup failed", e);
    }
  }
}
