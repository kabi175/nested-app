package com.nested.app.jobs;

import com.nested.app.client.mf.KycAPIClient;
import com.nested.app.client.mf.dto.KycCheck;
import com.nested.app.entity.User;
import com.nested.app.events.KycCompletedEvent;
import com.nested.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.Job;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Quartz job that polls KycAPIClient.isKycRecordAvailable every 30 minutes until KYC status reaches
 * a terminal state. The user ID is passed via the JobDataMap in the JobExecutionContext.
 *
 * <p>Status handling:
 *
 * <ul>
 *   <li>AVAILABLE → Update user KYC status to COMPLETED, publish KycCompletedEvent, delete job
 *   <li>REJECTED/EXPIRED → Update user KYC status to FAILED, delete job
 *   <li>NOT_AVAILABLE → Delete job (no status update)
 *   <li>SUBMITTED/PENDING → Continue polling
 * </ul>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KycStatusRefreshJob implements Job {

  private static final int RETRY_DELAY_SECONDS = 10;

  private final UserRepository userRepository;
  private final KycAPIClient kycAPIClient;
  private final ApplicationEventPublisher eventPublisher;

  @Override
  public void execute(JobExecutionContext context) throws JobExecutionException {
    Long userId = context.getJobDetail().getJobDataMap().getLong("userId");
    log.info("Executing KycStatusRefreshJob for user ID: {}", userId);

    try {
      User user =
          userRepository
              .findById(userId)
              .orElseThrow(() -> new JobExecutionException("User not found with ID: " + userId));

      String pan = user.getPanNumber();
      if (pan == null || pan.isBlank()) {
        log.error("User {} does not have a PAN number. Deleting job.", userId);
        deleteJob(context);
        return;
      }

      KycCheck kycCheck = kycAPIClient.isKycRecordAvailable(pan).block();
      if (kycCheck == null) {
        log.warn("KYC check returned null for user {}. Will retry.", userId);
        return;
      }

      KycCheck.Status status = kycCheck.getStatus();
      log.info("KYC status for user {} (PAN: {}): {}", userId, maskPan(pan), status);

      switch (status) {
        case AVAILABLE -> handleAvailable(context, user);
        case REJECTED, EXPIRED -> handleRejectedOrExpired(context, user, status);
        case NOT_AVAILABLE -> handleNotAvailable(context, userId);
        case SUBMITTED, PENDING -> handlePendingOrSubmitted(userId, status);
        default ->
            log.warn("Unknown KYC status {} for user {}. Will continue polling.", status, userId);
      }

    } catch (JobExecutionException e) {
      throw e;
    } catch (Exception e) {
      log.error(
          "Error executing KycStatusRefreshJob for user {}: {}. Rescheduling with {}s delay.",
          userId,
          e.getMessage(),
          RETRY_DELAY_SECONDS,
          e);
      rescheduleWithDelay(context);
    }
  }

  /**
   * Handle AVAILABLE status: Update user KYC status to COMPLETED, publish KycCompletedEvent, and
   * delete the job.
   */
  private void handleAvailable(JobExecutionContext context, User user)
      throws JobExecutionException {
    log.info("KYC status is AVAILABLE for user {}. Updating status to COMPLETED.", user.getId());

    user.setKycStatus(User.KYCStatus.COMPLETED);
    userRepository.save(user);

    eventPublisher.publishEvent(new KycCompletedEvent(this, user));
    log.info("Published KycCompletedEvent for user {}", user.getId());

    deleteJob(context);
  }

  /** Handle REJECTED or EXPIRED status: Update user KYC status to FAILED and delete the job. */
  private void handleRejectedOrExpired(
      JobExecutionContext context, User user, KycCheck.Status status) throws JobExecutionException {
    log.warn("KYC status is {} for user {}. Updating status to FAILED.", status, user.getId());

    user.setKycStatus(User.KYCStatus.FAILED);
    userRepository.save(user);

    deleteJob(context);
  }

  /** Handle NOT_AVAILABLE status: Delete the job without updating user status. */
  private void handleNotAvailable(JobExecutionContext context, Long userId)
      throws JobExecutionException {
    log.info("KYC status is NOT_AVAILABLE for user {}. No KYC record found. Deleting job.", userId);
    deleteJob(context);
  }

  /** Handle PENDING or SUBMITTED status: Continue polling, do nothing. */
  private void handlePendingOrSubmitted(Long userId, KycCheck.Status status) {
    log.debug("KYC status is {} for user {}. Will continue polling.", status, userId);
  }

  /** Delete the current job from the scheduler. */
  private void deleteJob(JobExecutionContext context) throws JobExecutionException {
    try {
      boolean deleted = context.getScheduler().deleteJob(context.getJobDetail().getKey());
      if (deleted) {
        log.info("Successfully deleted KycStatusRefreshJob: {}", context.getJobDetail().getKey());
      } else {
        log.warn("Failed to delete KycStatusRefreshJob: {}", context.getJobDetail().getKey());
      }
    } catch (Exception e) {
      log.error("Error deleting KycStatusRefreshJob: {}", e.getMessage(), e);
      throw new JobExecutionException("Failed to delete job", e);
    }
  }

  /** Reschedule the job trigger with a delay for retry after an error. */
  private void rescheduleWithDelay(JobExecutionContext context) throws JobExecutionException {
    try {
      Trigger oldTrigger = context.getTrigger();
      Trigger newTrigger =
          TriggerBuilder.newTrigger()
              .withIdentity(oldTrigger.getKey())
              .startAt(
                  java.util.Date.from(java.time.Instant.now().plusSeconds(RETRY_DELAY_SECONDS)))
              .withSchedule(
                  SimpleScheduleBuilder.simpleSchedule()
                      .withIntervalInMinutes(30)
                      .withRepeatCount(
                          oldTrigger instanceof org.quartz.SimpleTrigger st
                              ? st.getRepeatCount() - st.getTimesTriggered()
                              : 336))
              .build();

      context.getScheduler().rescheduleJob(oldTrigger.getKey(), newTrigger);
      log.info("Rescheduled KycStatusRefreshJob with {}s delay for retry.", RETRY_DELAY_SECONDS);
    } catch (Exception e) {
      log.error("Error rescheduling KycStatusRefreshJob: {}", e.getMessage(), e);
      throw new JobExecutionException("Failed to reschedule job", e);
    }
  }

  /** Mask PAN number for logging (show first 2 and last 2 characters). */
  private String maskPan(String pan) {
    if (pan == null || pan.length() < 5) {
      return "****";
    }
    return pan.substring(0, 2) + "****" + pan.substring(pan.length() - 2);
  }
}
