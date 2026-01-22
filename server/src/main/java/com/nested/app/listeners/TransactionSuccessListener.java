package com.nested.app.listeners;

import com.nested.app.entity.User;
import com.nested.app.events.TransactionSuccessEvent;
import com.nested.app.services.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Event listener for transaction success events. Sends transaction confirmation email to user when
 * a transaction is successfully processed.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class TransactionSuccessListener {

  private final EmailService emailService;

  /**
   * Handles TransactionSuccessEvent by sending a confirmation email to the user. Processes
   * asynchronously to avoid blocking the main flow.
   *
   * @param event The TransactionSuccessEvent containing transaction information
   */
  @Async
  @EventListener
  public void onTransactionSuccess(TransactionSuccessEvent event) {
    User user = event.user();
    log.info(
        "Processing TransactionSuccessEvent for user ID: {}, type: {}", user.getId(), event.type());

    try {
      String email = user.getEmail();
      String name = user.getFullName();

      if (email == null || email.isEmpty()) {
        log.warn(
            "Cannot send transaction success email for user ID: {} - email is missing",
            user.getId());
        return;
      }

      emailService.sendTransactionSuccessEmail(
          email, name, event.fundName(), event.amount(), event.type());
      log.info(
          "Transaction success email sent for user ID: {}, type: {}", user.getId(), event.type());
    } catch (Exception e) {
      log.error("Failed to send transaction success email for user ID: {}", user.getId(), e);
      // Don't rethrow - we don't want email failures to affect the transaction flow
    }
  }
}
