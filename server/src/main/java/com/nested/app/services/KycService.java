package com.nested.app.services;

import com.nested.app.client.mf.dto.KycInitiateRequest;
import com.nested.app.client.mf.dto.KycInitiateResponse;
import com.nested.app.client.tarrakki.KycClient;
import com.nested.app.entity.User;
import com.nested.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KycService {

    private final KycClient kycClient;
  private final UserRepository userRepository;

  @Value("${app.kyc.callback-url:http://localhost:8080/redirects/kyc}")
  private String kycCallbackUrl;

  public KycInitiateResponse initiateKyc(Long userId) {
    log.info("Initiating KYC for user ID: {}", userId);

    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

    // Build KYC initiate request
    String callbackUrl = kycCallbackUrl + "/" + user.getId();
    KycInitiateRequest request =
        new KycInitiateRequest(
            user.getFirstName() + (user.getLastName() != null ? " " + user.getLastName() : ""),
            user.getPanNumber(),
            user.getEmail(),
            user.getPhoneNumber(),
            callbackUrl);

    // Call KYC client synchronously (blocking)
    KycInitiateResponse response = kycClient.initiateKyc(request).block();

    if (response == null) {
      throw new RuntimeException("Failed to initiate KYC: No response from KYC service");
        }

    log.info(
        "KYC initiated successfully for user ID: {} with message: {}", userId, response.message());
    return response;
    }
}
