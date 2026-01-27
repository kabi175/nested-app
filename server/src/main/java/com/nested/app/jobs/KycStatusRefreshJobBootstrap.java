package com.nested.app.jobs;

import com.nested.app.entity.User;
import com.nested.app.repository.UserRepository;
import com.nested.app.services.QuartzJobSchedulerService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.SchedulerException;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * One-time startup job that schedules KycStatusRefreshJob for all existing users with KYC status
 * SUBMITTED who don't have a scheduled job yet.
 *
 * <p>This job runs once on application startup to handle users who were already in SUBMITTED status
 * before the KycStatusRefreshJob scheduling was introduced.
 *
 * <p><b>Note:</b> This component can be removed after it has been deployed and run successfully in
 * production, as all future users will have their jobs scheduled via KycRedirectService.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KycStatusRefreshJobBootstrap implements ApplicationRunner {

  private final UserRepository userRepository;
  private final QuartzJobSchedulerService quartzJobSchedulerService;

  @Override
  public void run(ApplicationArguments args) {
    log.info("Starting KycStatusRefreshJob bootstrap for existing SUBMITTED users...");

    try {
      List<User> submittedUsers = userRepository.findByKycStatus(User.KYCStatus.SUBMITTED);

      if (submittedUsers.isEmpty()) {
        log.info("No users found with KYC status SUBMITTED. Bootstrap complete.");
        return;
      }

      log.info(
          "Found {} users with KYC status SUBMITTED. Scheduling KycStatusRefreshJob for each.",
          submittedUsers.size());

      int successCount = 0;
      int skipCount = 0;
      int errorCount = 0;

      for (User user : submittedUsers) {
        try {
          // Check if user has a PAN number
          if (user.getPanNumber() == null || user.getPanNumber().isBlank()) {
            log.warn(
                "User {} does not have a PAN number. Skipping KycStatusRefreshJob scheduling.",
                user.getId());
            skipCount++;
            continue;
          }

          // scheduleKycStatusRefreshJob already checks for existing jobs and skips if found
          quartzJobSchedulerService.scheduleKycStatusRefreshJob(user.getId());
          successCount++;

        } catch (SchedulerException e) {
          log.error(
              "Failed to schedule KycStatusRefreshJob for user {}: {}",
              user.getId(),
              e.getMessage(),
              e);
          errorCount++;
        }
      }

      log.info(
          "KycStatusRefreshJob bootstrap completed. Scheduled: {}, Skipped (no PAN): {}, Errors: {}, Total: {}",
          successCount,
          skipCount,
          errorCount,
          submittedUsers.size());

    } catch (Exception e) {
      log.error("Error during KycStatusRefreshJob bootstrap: {}", e.getMessage(), e);
    }
  }
}
