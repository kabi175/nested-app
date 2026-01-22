package com.nested.app.services;

import com.nested.app.client.mf.InvestorAPIClient;
import com.nested.app.client.mf.KycAPIClient;
import com.nested.app.client.mf.dto.AddAddressRequest;
import com.nested.app.client.mf.dto.CreateAccountRequest;
import com.nested.app.dto.MinifiedUserDTO;
import com.nested.app.entity.User;
import com.nested.app.events.KycCompletedEvent;
import com.nested.app.repository.InvestorRepository;
import com.nested.app.repository.UserRepository;
import com.nested.app.services.mapper.CreateInvestorRequestMapper;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class InvestorServiceImpl implements InvestorService {
  private final UserRepository userRepository;
  private final InvestorRepository investorRepository;

  private final InvestorAPIClient investorAPIClient;
  private final KycAPIClient kycAPIClient;
  private final ApplicationEventPublisher eventPublisher;

  @Override
  public void createInvestor(MinifiedUserDTO userDto) {
    var user = userRepository.findById(userDto.getId()).orElseThrow();

    if (!Objects.equals(User.KYCStatus.COMPLETED, user.getKycStatus())) {
      log.error("KYC check is not COMPLETED for user ID: {}", user.getId());
      throw new RuntimeException("KYC check is not COMPLETED for user ID: " + user.getId());
    }

    if (user.isReadyToInvest()) {
      return;
    }

    var investorRequest = CreateInvestorRequestMapper.mapUserToCreateInvestorRequest(user);
    var response = investorAPIClient.createInvestor(investorRequest).block();
    if (response == null) {
      throw new RuntimeException("Failed to create investor for user ID: " + user.getId());
    }
    var investor = user.getInvestor();
    investor.setRef(response.getId());

    var createAccountRequest =
        CreateAccountRequest.builder()
            .investorID(response.getId())
            .emailRef(response.getEmailRef())
            .mobileRef(response.getMobileRef())
            .build();
    // Add address using investorAPIClient
    if (user.getAddress() != null) {
      var addressRequest = buildAddressRequestFromUser(user, response.getId());
      var addressResp = investorAPIClient.addAddress(addressRequest).block();
      if (addressResp == null) {
        log.warn("Failed to add address for investor ID: {}", response.getId());
      } else {
        createAccountRequest.setAddressRef(addressResp.getId());
      }
    }

    var accountResp = investorAPIClient.createInvestmentAccount(createAccountRequest).block();
    if (accountResp != null) {
      investor.setAccountRef(accountResp.getId());
    }

    investorRepository.save(investor);

    user.setKycStatus(User.KYCStatus.COMPLETED);
    user.setReadyToInvest(true);
    userRepository.save(user);
    eventPublisher.publishEvent(new KycCompletedEvent(this, user));
  }

  /** Builds address request from User entity */
  private AddAddressRequest buildAddressRequestFromUser(User user, String investorId) {
    var address = user.getAddress();
    return AddAddressRequest.builder()
        .investorID(investorId)
        .addressLine1(address.getAddressLine())
        .city(address.getCity())
        .state(address.getState())
        .country(address.getCountry())
        .pincode(address.getPinCode())
        .build();
  }
}
