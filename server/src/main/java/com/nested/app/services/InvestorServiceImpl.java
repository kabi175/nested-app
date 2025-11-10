package com.nested.app.services;

import com.nested.app.client.mf.InvestorAPIClient;
import com.nested.app.client.mf.KycAPIClient;
import com.nested.app.client.mf.dto.CreateInvestorRequest;
import com.nested.app.client.mf.dto.KycCheck;
import com.nested.app.dto.MinifiedUserDTO;
import com.nested.app.entity.Investor;
import com.nested.app.entity.User;
import com.nested.app.repository.InvestorRepository;
import com.nested.app.repository.UserRepository;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class InvestorServiceImpl implements InvestorService {
  private final UserRepository userRepository;
  private final InvestorRepository investorRepository;

  private final InvestorAPIClient investorAPIClient;
  private final KycAPIClient kycAPIClient;

  @Override
  public void createInvestor(MinifiedUserDTO userDto) {
    var user = userRepository.findById(userDto.getId()).orElseThrow();

    var kycCheck =
        kycAPIClient.isKycRecordAvailable(user.getPanNumber(), user.getDateOfBirth()).block();

    if (kycCheck == null) {
      log.error("KYC check returned null for user ID: {}", user.getId());
      throw new RuntimeException("Failed to fetch KYC status for user ID: " + user.getId());
    }

    if (Objects.equals(kycCheck.getStatus(), KycCheck.Status.AVAILABLE)) {
      throw HttpClientErrorException.BadRequest.create(
          HttpStatus.BAD_REQUEST, "KYC record not found", null, null, null);
    }

    var investorRequest = buildInvestorRequestFromUser(user);
    var response = investorAPIClient.createInvestor(investorRequest).block();
    if (response == null) {
      throw new RuntimeException("Failed to create investor for user ID: " + user.getId());
    }

    var investor = user.getInvestor();
    investor.setRef(response.getId());
    investorRepository.save(investor);

    user.setKycStatus(User.KYCStatus.COMPLETED);
    userRepository.save(user);
  }

  @Override
  public void createKycRequest(MinifiedUserDTO userDto) {
    var user = userRepository.findById(userDto.getId()).orElseThrow();

    var kycCheck =
        kycAPIClient.isKycRecordAvailable(user.getPanNumber(), user.getDateOfBirth()).block();

    if (kycCheck == null) {
      log.error("KYC check returned null for user ID in createKycRequest: {}", user.getId());
      throw new RuntimeException("Failed to fetch KYC status for user ID: " + user.getId());
    }

    if (Objects.equals(kycCheck.getStatus(), KycCheck.Status.AVAILABLE)
        && user.getInvestor() == null) {
      var investor = Investor.builder().type(Investor.Type.INDIVIDUAL).build();
      user.setInvestor(investor);
      user.setKycStatus(User.KYCStatus.COMPLETED);
    }

    if (List.of(KycCheck.Status.AVAILABLE, KycCheck.Status.PENDING, KycCheck.Status.SUBMITTED)
        .contains(kycCheck.getStatus())) {
      return;
    }

    var resp = kycAPIClient.createKyc(buildInvestorRequestFromUser(user)).block();

    if (resp == null) {
      throw new RuntimeException("Failed to create KYC request for user ID: " + user.getId());
    }

    var investor =
        Investor.builder().kycRequestRef(resp.getId()).type(Investor.Type.INDIVIDUAL).build();
    user.setInvestor(investor);
    user.setKycStatus(User.KYCStatus.PENDING);

    userRepository.save(user);
  }

  @Override
  public String eSignDocument(MinifiedUserDTO userDto) {
    var user = userRepository.findById(userDto.getId()).orElseThrow();

    if (!User.KYCStatus.PENDING.equals(user.getKycStatus())) {
      throw HttpClientErrorException.BadRequest.create(
          HttpStatus.BAD_REQUEST, "KYC not in pending state", null, null, null);
    }

    var res = kycAPIClient.createESignRequest(user.getInvestor().getKycRequestRef()).block();

    if (res == null) {
      log.error("eSign request returned null for user ID: {}", user.getId());
      throw new RuntimeException("Failed to create eSign request for user ID: " + user.getId());
    }

    user.getInvestor().setESignRequestRef(res.getId());
    investorRepository.save(user.getInvestor());
    return res.getRedirectUrl();
  }

  @Override
  public String aadhaarUploadViaURL(MinifiedUserDTO userDto) {

    var user = userRepository.findById(userDto.getId()).orElseThrow();

    if (!User.KYCStatus.PENDING.equals(user.getKycStatus())) {
      throw HttpClientErrorException.BadRequest.create(
          HttpStatus.BAD_REQUEST, "KYC not in pending state", null, null, null);
    }

    var res =
        kycAPIClient.createAadhaarUploadRequest(user.getInvestor().getKycRequestRef()).block();

    if (res == null) {
      log.error("Aadhaar upload request returned null for user ID: {}", user.getId());
      throw new RuntimeException(
          "Failed to create Aadhaar upload request for user ID: " + user.getId());
    }

    return res.getRedirectUrl();
  }

  @Override
  public void uploadSignature(MinifiedUserDTO userDto, MultipartFile signatureFile) {
    var user = userRepository.findById(userDto.getId()).orElseThrow();

    investorAPIClient.uploadSignature(user.getInvestor().getRef(), signatureFile).block();
  }

  /** Builds investor request from User entity */
  private CreateInvestorRequest buildInvestorRequestFromUser(User user) {
    CreateInvestorRequest request = new CreateInvestorRequest();

    request.setInvestor_type(CreateInvestorRequest.InvestorType.INDIVIDUAL);

    // Split name into first and last name
    request.setFirstName(user.getFirstName());
    request.setLastName(user.getLastName());

    request.setDob(user.getDateOfBirth());

    // Map gender
    request.setGender(mapUserGenderToInvestorGender(user.getGender()));

    request.setPan(user.getPanNumber());
    request.setEmail(user.getEmail());

    request.setMobileNumber(user.getPhoneNumber());

    return request;
  }

  /**
   * Maps User.Gender to CreateInvestorRequest.Gender
   *
   * @param gender User.Gender gender to map
   * @return CreateInvestorRequest.Gender mapped gender
   */
  private CreateInvestorRequest.Gender mapUserGenderToInvestorGender(User.Gender gender) {
    return switch (gender) {
      case User.Gender.MALE -> CreateInvestorRequest.Gender.MALE;
      case User.Gender.FEMALE -> CreateInvestorRequest.Gender.FEMALE;
      default -> CreateInvestorRequest.Gender.TRANSGENDER;
    };
  }
}
