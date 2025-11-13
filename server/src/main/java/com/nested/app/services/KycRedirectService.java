package com.nested.app.services;

import com.nested.app.client.mf.KycAPIClient;
import com.nested.app.entity.User;
import com.nested.app.events.UserUpdateEvent;
import com.nested.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KycRedirectService {

  private final UserRepository userRepository;
  private final KycAPIClient kycAPIClient;
  private final ApplicationEventPublisher publisher;

  /**
   * Handle Aadhaar upload redirect. Updates the user's KYC status to E_SIGN_PENDING after
   * successful Aadhaar upload.
   *
   * @param kycRequestId The KYC request ID from the redirect
   */
  public void handleAadhaarUploadRedirect(String kycRequestId) {
    log.info("Processing Aadhaar upload redirect for KYC request ID: {}", kycRequestId);

    // Find user by KYC request reference through investor
    User user = findUserByKycRequestRef(kycRequestId);

    var isSuccess = kycAPIClient.updateAadhaarProof(kycRequestId).block();
    if (!Boolean.TRUE.equals(isSuccess)) {
      log.error("Aadhaar upload redirect processing failed");
      return;
    }

    // Store the original user state for event
    User originalUser = user;

    // Update KYC status to E_SIGN_PENDING
    user = user.withKycStatus(User.KYCStatus.E_SIGN_PENDING);
    userRepository.save(user);

    // Fire user update event
    publisher.publishEvent(new UserUpdateEvent(originalUser, user));

    log.info(
        "Successfully updated KYC status to E_SIGN_PENDING for user ID: {} (KYC Request ID: {})",
        user.getId(),
        kycRequestId);
  }

  /**
   * Handle eSign redirect. Can be extended to handle eSign completion logic.
   *
   * @param kycRequestId The KYC request ID from the redirect
   */
  public void handleESignRedirect(String kycRequestId) {
    log.info("Processing eSign redirect for KYC request ID: {}", kycRequestId);

    // Find user by KYC request reference through investor
    User user = findUserByKycRequestRef(kycRequestId);

    var isSuccess = kycAPIClient.isESignSuccess(user.getInvestor().getESignRequestRef()).block();
    if (!Boolean.TRUE.equals(isSuccess)) {
      log.error("ESign redirect processing failed");
      return;
    }

    log.info(
        "eSign redirect processed for user ID: {} (KYC Request ID: {})",
        user.getId(),
        kycRequestId);

    // Store the original user state for event
    User originalUser = user;

    user = user.withKycStatus(User.KYCStatus.SUBMITTED);
    userRepository.save(user);

    // Fire user update event
    publisher.publishEvent(new UserUpdateEvent(originalUser, user));

    log.info(
        "Successfully updated KYC status to SUBMITTED for user ID: {} (KYC Request ID: {})",
        user.getId(),
        kycRequestId);
  }

  /**
   * Find user by KYC request reference. Looks up the investor by kycRequestRef and then finds the
   * associated user.
   *
   * @param kycRequestId The KYC request ID to search for
   * @return The User associated with the KYC request
   * @throws IllegalArgumentException if user is not found
   */
  private User findUserByKycRequestRef(String kycRequestId) {
    return userRepository.findAll().stream()
        .filter(
            u -> u.getInvestor() != null && kycRequestId.equals(u.getInvestor().getKycRequestRef()))
        .findFirst()
        .orElseThrow(
            () ->
                new IllegalArgumentException("User not found for KYC request ID: " + kycRequestId));
  }
}
