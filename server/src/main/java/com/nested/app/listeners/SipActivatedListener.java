package com.nested.app.listeners;

import com.nested.app.entity.User;
import com.nested.app.events.SipActivatedEvent;
import com.nested.app.services.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Event listener for SIP activation events. Sends a SIP activation confirmation email to the user
 * when a SIP is successfully activated.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SipActivatedListener {

  private final EmailService emailService;

  /**
   * Handles SipActivatedEvent by sending a confirmation email. Processes asynchronously to avoid
   * blocking the main SIP activation flow.
   *
   * @param event The SipActivatedEvent containing SIP and goal information
   */
  @Async
  @EventListener
  public void onSipActivated(SipActivatedEvent event) {
    User user = event.user();
    log.info("Processing SipActivatedEvent for user ID: {}", user.getId());

    try {
      String email = user.getEmail();
      if (email == null || email.isEmpty()) {
        log.warn(
            "Cannot send SIP activation email for user ID: {} - email is missing", user.getId());
        return;
      }

      emailService.sendSipActivatedEmail(
          email,
          user.getFullName(),
          event.totalSipAmount(),
          event.goalOrChildName(),
          event.fundNames());

      log.info("SIP activation email sent for user ID: {}", user.getId());
    } catch (Exception e) {
      log.error("Failed to send SIP activation email for user ID: {}", user.getId(), e);
      // Don't rethrow - email failure must not affect the SIP activation flow
    }
  }
}
