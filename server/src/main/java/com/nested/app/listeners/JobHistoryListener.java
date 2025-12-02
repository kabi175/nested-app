package com.nested.app.listeners;

import com.nested.app.entity.JobHistory;
import com.nested.app.enums.JobExecutionStatus;
import com.nested.app.repository.JobHistoryRepository;
import java.sql.Timestamp;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.JobListener;
import org.springframework.stereotype.Component;

/**
 * Global Quartz JobListener that records execution history for all jobs. Captures start time, end
 * time, duration, status, and error messages for monitoring and auditing.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JobHistoryListener implements JobListener {

  private static final String LISTENER_NAME = "JobHistoryListener";
  private static final String START_TIME_KEY = "jobHistoryStartTime";
  private static final int MAX_ERROR_MESSAGE_LENGTH = 4000;

  private final JobHistoryRepository jobHistoryRepository;

  @Override
  public String getName() {
    return LISTENER_NAME;
  }

  /**
   * Called before a job is executed. Records the start time in the job context.
   *
   * @param context the job execution context
   */
  @Override
  public void jobToBeExecuted(JobExecutionContext context) {
    long startTime = System.currentTimeMillis();
    context.put(START_TIME_KEY, startTime);

    log.debug(
        "Job {} with trigger {} is about to execute",
        context.getJobDetail().getKey().getName(),
        context.getTrigger().getKey().getName());
  }

  /**
   * Called after a job has been executed. Calculates duration and saves execution history.
   *
   * @param context the job execution context
   * @param jobException the exception thrown by the job (null if successful)
   */
  @Override
  public void jobWasExecuted(JobExecutionContext context, JobExecutionException jobException) {
    try {
      long endTime = System.currentTimeMillis();
      Long startTime = (Long) context.get(START_TIME_KEY);

      if (startTime == null) {
        log.warn(
            "Start time not found for job {}. Skipping history recording.",
            context.getJobDetail().getKey().getName());
        return;
      }

      long durationMs = endTime - startTime;

      JobHistory jobHistory =
          JobHistory.builder()
              .jobName(context.getJobDetail().getKey().getName())
              .triggerName(context.getTrigger().getKey().getName())
              .startTime(Timestamp.from(Instant.ofEpochMilli(startTime)))
              .endTime(Timestamp.from(Instant.ofEpochMilli(endTime)))
              .durationMs(durationMs)
              .status(
                  jobException == null ? JobExecutionStatus.SUCCESS : JobExecutionStatus.FAILURE)
              .errorMessage(jobException != null ? truncateErrorMessage(jobException) : null)
              .build();

      jobHistoryRepository.save(jobHistory);

      log.debug(
          "Job {} completed with status {} in {}ms",
          jobHistory.getJobName(),
          jobHistory.getStatus(),
          durationMs);

    } catch (Exception e) {
      log.error(
          "Failed to record job history for job {}: {}",
          context.getJobDetail().getKey().getName(),
          e.getMessage(),
          e);
    }
  }

  /**
   * Called when a job execution is vetoed by a TriggerListener. This implementation does nothing as
   * vetoed jobs are not executed.
   *
   * @param context the job execution context
   */
  @Override
  public void jobExecutionVetoed(JobExecutionContext context) {
    log.debug(
        "Job {} execution was vetoed by trigger {}",
        context.getJobDetail().getKey().getName(),
        context.getTrigger().getKey().getName());
  }

  /**
   * Truncates error message to prevent database issues with very long stack traces.
   *
   * @param exception the job execution exception
   * @return truncated error message
   */
  private String truncateErrorMessage(JobExecutionException exception) {
    if (exception == null) {
      return null;
    }

    StringBuilder errorMsg = new StringBuilder();
    errorMsg.append(exception.getClass().getName()).append(": ").append(exception.getMessage());

    if (exception.getCause() != null) {
      errorMsg
          .append(" | Caused by: ")
          .append(exception.getCause().getClass().getName())
          .append(": ")
          .append(exception.getCause().getMessage());
    }

    String fullMessage = errorMsg.toString();
    if (fullMessage.length() > MAX_ERROR_MESSAGE_LENGTH) {
      return fullMessage.substring(0, MAX_ERROR_MESSAGE_LENGTH - 3) + "...";
    }

    return fullMessage;
  }
}
