package com.nested.app.listeners;

import com.nested.app.dto.MinifiedUserDTO;
import com.nested.app.entity.User;
import com.nested.app.events.KycCompletedEvent;
import com.nested.app.services.EmailService;
import com.nested.app.services.InvestorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Event listener for KYC completion events. Sends welcome email to user when KYC is successfully
 * completed.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KycCompletedListener {

  private final EmailService emailService;
  private final InvestorService investorService;

  /**
   * Handles KycCompletedEvent by sending a welcome email to the user. Processes asynchronously to
   * avoid blocking the main flow.
   *
   * @param event The KycCompletedEvent containing user information
   */
  @Async
  @EventListener
  public void onKycCompleted(KycCompletedEvent event) {
    User user = event.getUser();
    log.info("Processing KycCompletedEvent for user ID: {}", user.getId());

    try {

      var userDto = new MinifiedUserDTO();
      userDto.setId(user.getId());
      investorService.createInvestor(userDto);

      String email = user.getEmail();
      String name = user.getFullName();

      if (email == null || email.isEmpty()) {
        log.warn("Cannot send welcome email for user ID: {} - email is missing", user.getId());
        return;
      }

      emailService.sendWelcomeEmail(email, name);
      log.info("Welcome email sent successfully for user ID: {}", user.getId());
    } catch (Exception e) {
      log.error("Failed to send welcome email for user ID: {}", user.getId(), e);
      // Don't rethrow - we don't want email failures to affect the KYC process
    }
  }
}
