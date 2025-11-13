package com.nested.app.services;

import com.nested.app.client.mf.KycAPIClient;
import com.nested.app.entity.User;
import com.nested.app.repository.InvestorRepository;
import com.nested.app.repository.UserRepository;
import com.nested.app.services.mapper.CreateKYCRequestMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class KycService {

  private final KycAPIClient kycAPIClient;
  private final UserRepository userRepository;
  private final InvestorRepository investorRepository;

  @Value("${app.kyc.callback-url:http://localhost:8080/redirects/kyc}")
  private String kycCallbackUrl;

  public void initiateKyc(Long userId) {
    log.info("Initiating KYC for user ID: {}", userId);

    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

    // Build KYC initiate request

    var request = CreateKYCRequestMapper.mapUserToCreateKYCRequest(user);

    // Call KYC client synchronously (blocking)
    var response = kycAPIClient.createKyc(request).block();

    if (response == null) {
      throw new RuntimeException("Failed to initiate KYC: No response from KYC service");
    }

    user.getInvestor().setKycRequestRef(response.getId());

    investorRepository.save(user.getInvestor());
    log.info("KYC initiated successfully for user ID: {}", userId);
  }
}
