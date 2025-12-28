package com.nested.app.services;

import com.nested.app.client.mf.KycAPIClient;
import com.nested.app.entity.User;
import com.nested.app.events.UserUpdateEvent;
import com.nested.app.exception.ExternalServiceException;
import com.nested.app.repository.InvestorRepository;
import com.nested.app.repository.UserRepository;
import com.nested.app.services.mapper.CreateKYCRequestMapper;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KycService {

  private final KycAPIClient kycAPIClient;
  private final UserRepository userRepository;
  private final InvestorRepository investorRepository;
  private final ApplicationEventPublisher publisher;

  @Value("${app.kyc.callback-url:http://localhost:8080/redirects/kyc}")
  private String kycCallbackUrl;

  public void initiateKyc(Long userId) {
    try {
      log.info("Initiating KYC for user ID: {}", userId);

      User user =
          userRepository
              .findById(userId)
              .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

      var originalUser = user;
      // Build KYC initiate request

      if (List.of(User.KYCStatus.UNKNOWN, User.KYCStatus.FAILED).contains(user.getKycStatus())) {
        var resp =
            kycAPIClient.isKycRecordAvailable(user.getPanNumber(), user.getDateOfBirth()).block();

        if (resp == null) {
          throw new ExternalServiceException(
              "Failed to check KYC record: No response from KYC service");
        }

        user =
            switch (resp.getStatus()) {
              case NOT_AVAILABLE, EXPIRED -> {
                log.info("No existing KYC record found for user ID: {}", userId);
                yield user.withKycStatus(User.KYCStatus.PENDING);
              }
              case AVAILABLE -> {
                log.info("Existing KYC record found for user ID: {}", userId);
                yield user.withKycStatus(User.KYCStatus.COMPLETED);
              }
              case SUBMITTED -> {
                log.info("KYC already submitted for user ID: {}", userId);
                yield user.withKycStatus(User.KYCStatus.SUBMITTED);
              }
              case REJECTED -> {
                log.info("KYC previously rejected for user ID: {}", userId);
                yield user.withKycStatus(User.KYCStatus.FAILED);
              }
              default -> user;
            };
      }

      if (!List.of(User.KYCStatus.PENDING, User.KYCStatus.FAILED).contains(user.getKycStatus())) {
        userRepository.save(user);
        // Fire user update event
        publisher.publishEvent(new UserUpdateEvent(originalUser, user));

        return;
      }

      var request = CreateKYCRequestMapper.mapUserToCreateKYCRequest(user);

      // Call KYC client synchronously (blocking)
      var response = kycAPIClient.createKyc(request).block();

      if (response == null) {
        throw new ExternalServiceException("Failed to initiate KYC: No response from KYC service");
      }

      user.setKycStatus(User.KYCStatus.AADHAAR_PENDING);
      user.getInvestor().setKycRequestRef(response.getId());

      userRepository.save(user);
      investorRepository.save(user.getInvestor());
      log.info("KYC initiated successfully for user ID: {}", userId);
    } catch (Exception e) {
      log.error("Failed to initiate KYC for user ID: {}", userId, e);
      throw new ExternalServiceException("Failed to initiate KYC for user ID: " + userId, e);
    }
  }
}
