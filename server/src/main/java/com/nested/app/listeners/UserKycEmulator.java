package com.nested.app.listeners;

import com.nested.app.client.mf.KycAPIClient;
import com.nested.app.entity.User;
import com.nested.app.events.UserUpdateEvent;
import com.nested.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Event listener for emulating KYC completion in development profile. When user status is
 * SUBMITTED, automatically transitions to COMPLETED after 10 seconds. This listener runs
 * asynchronously to avoid blocking the main user thread.
 */
@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class UserKycEmulator {

  private final UserRepository userRepository;
  private final KycAPIClient kycAPIClient;

  @EventListener
  @Async
  public void onUserUpdate(UserUpdateEvent event) {
    User newUser = event.newUser();

    if (User.KYCStatus.SUBMITTED.equals(newUser.getKycStatus())) {
      log.info(
          "KYC Emulator: User {} transitioned to SUBMITTED status. Scheduling auto-completion in 10 seconds...",
          newUser.getId());
      scheduleKycCompletion(newUser.getId());
    }
  }

  private void scheduleKycCompletion(Long userId) {
    // Use a separate thread to avoid blocking
    new Thread(
            () -> {
              try {
                log.info(
                    "KYC Emulator: Waiting 10 seconds before completing KYC for user {}", userId);
                Thread.sleep(10000); // Wait 10 seconds

                User user =
                    userRepository
                        .findById(userId)
                        .orElseThrow(
                            () ->
                                new IllegalArgumentException("User not found with ID: " + userId));

                try {
                  kycAPIClient.completeKycRequest(user.getInvestor().getKycRequestRef()).block();
                  log.info("KYC Emulator: Completing KYC for user {}", userId);
                  user.setKycStatus(User.KYCStatus.COMPLETED);
                } catch (Exception e) {
                  log.error("KYC Emulator: Failing KYC for user {}", userId);
                  user.setKycStatus(User.KYCStatus.FAILED);
                }

                userRepository.save(user);

                log.info("KYC Emulator: Successfully completed KYC for user {}", userId);
              } catch (InterruptedException e) {
                log.error("KYC Emulator: Thread interrupted while waiting for user {}", userId, e);
                Thread.currentThread().interrupt();
              } catch (Exception e) {
                log.error("KYC Emulator: Error completing KYC for user {}", userId, e);
              }
            })
        .start();
  }
}
