package com.nested.app.services;

import com.nested.app.client.mf.OtpApiClient;
import com.nested.app.client.mf.dto.AddAddressRequest;
import com.nested.app.client.mf.dto.CreateInvestorRequest;
import com.nested.app.client.mf.dto.CreateInvestorResponse;
import com.nested.app.client.mf.dto.FATCAUploadRequest;
import com.nested.app.client.mf.dto.NomineeRequest;
import com.nested.app.client.mf.dto.NomineeResponse;
import com.nested.app.client.mf.dto.OtpRequest;
import com.nested.app.client.mf.dto.OtpResponse;
import com.nested.app.client.mf.dto.OtpVerifyRequest;
import com.nested.app.client.tarrakki.TarrakkiInvestorAPIClient;
import com.nested.app.dto.BankAccountDto;
import com.nested.app.entity.Child;
import com.nested.app.entity.Investor;
import com.nested.app.entity.User;
import com.nested.app.enums.Occupation;
import com.nested.app.repository.BankDetailRepository;
import com.nested.app.repository.ChildRepository;
import com.nested.app.repository.InvestorRepository;
import com.nested.app.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClientResponseException;

/**
 * Service implementation for managing Investor entities Handles business logic for investor
 * creation and management
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
@Deprecated
public class InvestorServiceTImpl {

  private final BankDetailRepository bankDetailRepository;
  private final TarrakkiInvestorAPIClient investorAPIClient;
  private final InvestorRepository investorRepository;
  private final UserRepository userRepository;
  private final ChildRepository childRepository;
  private final OtpApiClient otpApiClient;

  /**
   * Creates an investor for a user (individual type)
   *
   * @param userId User ID
   * @return Created Investor entity
   */
  public Investor createInvestorForUser(Long userId) {
    log.info("Creating investor for user ID: {}", userId);

    // Get user entity
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

    // Check if investor already exists
    if (user.getInvestor() != null) {
      return user.getInvestor();
    }

    // Validate required fields
    validateUserForInvestorCreation(user);

    // Build Tarrakki request
    CreateInvestorRequest request = buildInvestorRequestFromUser(user);

    // Call Tarrakki API
    CreateInvestorResponse response;
    try {
      response = investorAPIClient.createInvestor(request).block();
      if (response == null) {
        throw new RuntimeException("Failed to create investor: null response from Tarrakki API");
      }
    } catch (WebClientResponseException e) {
      log.error(
          "Error calling Tarrakki API for user {}: {}", userId, e.getResponseBodyAsString(), e);
      throw new RuntimeException("Failed to create investor in Tarrakki", e);
    } catch (Exception e) {
      log.error("Error calling Tarrakki API for user {}: {}", userId, e.getMessage(), e);
      throw new RuntimeException("Failed to create investor in Tarrakki", e);
    }

    // Create and save Investor entity
    Investor investor = Investor.builder().build();
    investor.setType(Investor.Type.INDIVIDUAL);
    investor.setRef(response.getId());

    Investor savedInvestor = investorRepository.save(investor);

    // Link investor to user
    user.setInvestor(savedInvestor);
    userRepository.save(user);

    log.info(
        "Successfully created investor for user ID: {} with Tarrakki ref: {}",
        userId,
        response.getId());

    return savedInvestor;
  }

  /**
   * Creates an investor for a child (minor type)
   *
   * @param childId Child ID
   * @return Created Investor entity
   */
  public Investor createInvestorForChild(Long childId) {
    log.info("Creating investor for child ID: {}", childId);

    // Get child entity with user
    Child child =
        childRepository
            .findById(childId)
            .orElseThrow(() -> new IllegalArgumentException("Child not found with ID: " + childId));

    // Check if investor already exists
    if (child.getInvestor() != null) {
      throw new IllegalStateException("Investor already exists for child ID: " + childId);
    }

    User parentUser = child.getUser();
    if (parentUser == null) {
      throw new IllegalStateException("Parent user not found for child ID: " + childId);
    }

    CreateInvestorRequest request;
    if (child.isInvestUnderChild()) {
      // Validate required fields
      validateChildForInvestorCreation(child, parentUser);

      // Build Tarrakki request (using child's personal data + parent's other data)
      request = buildInvestorRequestFromChild(child, parentUser);
    } else {
      validateUserForInvestorCreation(parentUser);

      // Build Tarrakki request
      request = buildInvestorRequestFromUser(parentUser);
    }

    // Call Tarrakki API
    CreateInvestorResponse response;
    try {
      response = investorAPIClient.createInvestor(request).block();
      if (response == null) {
        throw new RuntimeException("Failed to create investor: null response from Tarrakki API");
      }
    } catch (WebClientResponseException e) {
      log.error(
          "Error calling Tarrakki API for child {}: {}", childId, e.getResponseBodyAsString(), e);
      throw new RuntimeException("Failed to create investor in Tarrakki", e);
    } catch (Exception e) {
      log.error("Error calling Tarrakki API for child {}: {}", childId, e.getMessage(), e);
      throw new RuntimeException("Failed to create investor in Tarrakki", e);
    }

    // Create and save Investor entity
    Investor investor = Investor.builder().build();
    investor.setType(Investor.Type.MINOR);
    investor.setRef(response.getId());

    Investor savedInvestor = investorRepository.save(investor);

    // Link investor to child
    child.setInvestor(savedInvestor);
    childRepository.save(child);

    log.info(
        "Successfully created investor for child ID: {} with Tarrakki ref: {}",
        childId,
        response.getId());

    return savedInvestor;
  }

  /** Validates that user has all required fields for investor creation */
  private void validateUserForInvestorCreation(User user) {
    if (user.getFirstName() == null || user.getFirstName().isEmpty()) {
      throw new IllegalArgumentException("User name is required");
    }
    if (user.getLastName() == null || user.getLastName().length() < 2) {
      throw new IllegalArgumentException("User last name is required");
    }
    if (user.getDateOfBirth() == null) {
      throw new IllegalArgumentException("User date of birth is required");
    }
    if (user.getGender() == null) {
      throw new IllegalArgumentException("User gender is required");
    }
    if (user.getPanNumber() == null || user.getPanNumber().isEmpty()) {
      throw new IllegalArgumentException("User PAN number is required");
    }
    if (user.getEmail() == null || user.getEmail().isEmpty()) {
      throw new IllegalArgumentException("User email is required");
    }
    if (user.getPhoneNumber() == null || user.getPhoneNumber().isEmpty()) {
      throw new IllegalArgumentException("User phone number is required");
    }
    if (user.getAddress() == null) {
      throw new IllegalArgumentException("User address is required");
    }
    if (user.getBirthPlace() == null || user.getBirthPlace().isEmpty()) {
      throw new IllegalArgumentException("User birth place is required");
    }
    if (user.getBirthCountry() == null || user.getBirthCountry().isEmpty()) {
      throw new IllegalArgumentException("User birth country is required");
    }
  }

  /** Validates that child and parent have all required fields for investor creation */
  private void validateChildForInvestorCreation(Child child, User parentUser) {
    if (child.getFirstName() == null || child.getFirstName().isEmpty()) {
      throw new IllegalArgumentException("Child first name is required");
    }
    if (child.getLastName() == null || child.getLastName().isEmpty()) {
      throw new IllegalArgumentException("Child last name is required");
    }
    if (child.getDateOfBirth() == null) {
      throw new IllegalArgumentException("Child date of birth is required");
    }
    if (child.getGender() == null) {
      throw new IllegalArgumentException("Child gender is required");
    }

    // Validate parent user fields
    if (parentUser.getPanNumber() == null || parentUser.getPanNumber().isEmpty()) {
      throw new IllegalArgumentException("Parent PAN number is required");
    }
    if (parentUser.getEmail() == null || parentUser.getEmail().isEmpty()) {
      throw new IllegalArgumentException("Parent email is required");
    }
    if (parentUser.getPhoneNumber() == null || parentUser.getPhoneNumber().isEmpty()) {
      throw new IllegalArgumentException("Parent phone number is required");
    }
    if (parentUser.getAddress() == null) {
      throw new IllegalArgumentException("Parent address is required");
    }
    if (parentUser.getBirthPlace() == null || parentUser.getBirthPlace().isEmpty()) {
      throw new IllegalArgumentException("Parent birth place is required");
    }
    if (parentUser.getBirthCountry() == null || parentUser.getBirthCountry().isEmpty()) {
      throw new IllegalArgumentException("Parent birth country is required");
    }
  }

  /** Builds Tarrakki investor request from User entity */
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

  private AddAddressRequest buildAddressDtoFromUser(User user) {
    return AddAddressRequest.builder()
        .addressLine1(user.getAddress().getAddressLine())
        .city(user.getAddress().getCity())
        .state(user.getAddress().getState())
        .country(user.getAddress().getCountry())
        .pincode(user.getAddress().getPinCode())
        .build();
  }

  private FATCAUploadRequest.Occupation mapUserOccupationToFatcaOccupation(Occupation occupation) {
    return switch (occupation) {
      case BUSINESS -> FATCAUploadRequest.Occupation.BUSINESS;
      case PROFESSIONAL -> FATCAUploadRequest.Occupation.PROFESSIONAL;
      case RETIRED -> FATCAUploadRequest.Occupation.RETIRED;
      case HOUSEWIFE -> FATCAUploadRequest.Occupation.HOUSEWIFE;
      case STUDENT -> FATCAUploadRequest.Occupation.STUDENT;
      case GOVERNMENT_SERVICE -> FATCAUploadRequest.Occupation.GOVERNMENT_SERVICE;
      case DOCTOR -> FATCAUploadRequest.Occupation.DOCTOR;
      case PRIVATE_SECTOR_SERVICE -> FATCAUploadRequest.Occupation.PRIVATE_SECTOR;
      case PUBLIC_SECTOR_SERVICE -> FATCAUploadRequest.Occupation.PUBLIC_SECTOR;
      case FOREX_DEALER -> FATCAUploadRequest.Occupation.FOREX_DEALER;
      case AGRICULTURE -> FATCAUploadRequest.Occupation.AGRICULTURE;
      default -> FATCAUploadRequest.Occupation.OTHERS;
    };
  }

  private FATCAUploadRequest.IncomeSource mapUserIncomeSourceToFatcaIncomeSource(
      com.nested.app.enums.IncomeSource incomeSource) {
    return switch (incomeSource) {
      case SALARY -> FATCAUploadRequest.IncomeSource.SALARY;
      case BUSINESS_INCOME -> FATCAUploadRequest.IncomeSource.BUSINESS;
      case RENTAL_INCOME -> FATCAUploadRequest.IncomeSource.RENTAL_INCOME;
      case PRIZE_MONEY -> FATCAUploadRequest.IncomeSource.PRIZE_MONEY;
      case ROYALTY -> FATCAUploadRequest.IncomeSource.ROYALTY;
      case ANCESTRAL_PROPERTY -> FATCAUploadRequest.IncomeSource.ANCESTRAL_PROPERTY;
      default -> FATCAUploadRequest.IncomeSource.OTHERS;
    };
  }

  /** Builds Tarrakki investor request from Child entity (using parent's data for most fields) */
  private CreateInvestorRequest buildInvestorRequestFromChild(Child child, User parentUser) {
    CreateInvestorRequest request = new CreateInvestorRequest();

    request.setInvestor_type(CreateInvestorRequest.InvestorType.MINOR);

    // Use child's name and DOB
    request.setFirstName(child.getFirstName());
    request.setLastName(child.getLastName() != null ? child.getLastName() : "");

    request.setDob(child.getDateOfBirth());

    // Map child's gender
    request.setGender(mapUserGenderToInvestorGender(child.getGender()));

    // Use parent's data for remaining fields
    request.setPan(parentUser.getPanNumber());
    request.setEmail(parentUser.getEmail());

    request.setMobileNumber(parentUser.getPhoneNumber());

    return request;
  }

  /**
   * Maps User.Gender to CreateInvestorRequest.Gender
   *
   * @param gender User.Gender gender to map
   * @return CreateInvestorRequest.Gender mapped gender
   */
  private com.nested.app.client.mf.dto.Gender mapUserGenderToInvestorGender(User.Gender gender) {
    return switch (gender) {
      case User.Gender.MALE -> com.nested.app.client.mf.dto.Gender.MALE;
      case User.Gender.FEMALE -> com.nested.app.client.mf.dto.Gender.FEMALE;
      default -> com.nested.app.client.mf.dto.Gender.TRANSGENDER;
    };
  }

  /**
   * Adds a bank account for an investor
   *
   * @param userID userID
   * @return Bank ID from Tarrakki
   */
  @Deprecated
  public BankAccountDto addBankAccount(Long userID, BankAccountDto bankAccountDto) {

    var bank = bankAccountDto.toEntity();

    var user =
        userRepository
            .findById(userID)
            .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userID));
    bank.setUser(user);

    bank = bankDetailRepository.save(bank);

    return BankAccountDto.fromEntity(bankDetailRepository.findById(bank.getId()).orElseThrow());
  }

  @Deprecated
  public List<BankAccountDto> findBankAccountByUserId(Long userID) {
    var bankAccounts = bankDetailRepository.findAllByUserId(userID);
    return bankAccounts.stream().map(BankAccountDto::fromEntity).toList();
  }

  /**
   * Uploads a document for an investor
   *
   * @param investorId Investor ID
   * @param documentType Document type (signature, photo, etc.)
   * @param file Document file
   */
  public void uploadDocument(Long investorId, String documentType, MultipartFile file) {
    log.info("Uploading document for investor ID: {}", investorId);

    Investor investor =
        investorRepository
            .findById(investorId)
            .orElseThrow(
                () -> new IllegalArgumentException("Investor not found with ID: " + investorId));

    if (investor.getRef() == null) {
      throw new IllegalStateException("Investor does not have a Tarrakki reference ID");
    }

    // Validate file
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("Document file is required");
    }

    // Call Tarrakki API
    try {
      investorAPIClient.uploadDocument(documentType.toLowerCase(), file).block();
    } catch (Exception e) {
      log.error("Error uploading document for investor {}: {}", investorId, e.getMessage(), e);
      throw new RuntimeException("Failed to upload document", e);
    }

    log.info("Successfully uploaded document for investor ID: {}", investorId);
  }

  /**
   * Sends OTP for nominee addition
   *
   * @param investorId Investor ID
   * @return OTP response with otp_id
   */
  public OtpResponse sendNomineeOtp(Long investorId) {
    log.info("Sending nominee OTP for investor ID: {}", investorId);

    Investor investor =
        investorRepository
            .findById(investorId)
            .orElseThrow(
                () -> new IllegalArgumentException("Investor not found with ID: " + investorId));

    if (investor.getRef() == null) {
      throw new IllegalStateException("Investor does not have a Tarrakki reference ID");
    }

    // Create OTP request
    OtpRequest otpRequest = new OtpRequest();
    otpRequest.setInvestor_id(investor.getRef());
    otpRequest.setOtp_type(OtpRequest.Type.NOMINEE);

    // Call Tarrakki API
    OtpResponse response;
    try {
      response = otpApiClient.sendOtp(otpRequest).block();
      if (response == null) {
        throw new RuntimeException("Failed to send OTP: null response from Tarrakki API");
      }
    } catch (Exception e) {
      log.error("Error sending nominee OTP for investor {}: {}", investorId, e.getMessage(), e);
      throw new RuntimeException("Failed to send nominee OTP", e);
    }

    log.info(
        "Successfully sent nominee OTP for investor ID: {} with otp_id: {}",
        investorId,
        response.getOtpId());

    return response;
  }

  /**
   * Verifies OTP for nominee addition
   *
   * @param otpId OTP ID from send OTP response
   * @param otp OTP code
   * @return true if OTP is valid
   */
  public boolean verifyNomineeOtp(String otpId, String otp) {
    log.info("Verifying nominee OTP for otp_id: {}", otpId);

    OtpVerifyRequest verifyRequest = new OtpVerifyRequest();
    verifyRequest.setOtp_type(OtpRequest.Type.NOMINEE);
    verifyRequest.setOtp(otp);

    // Call Tarrakki API
    Boolean isValid;
    try {
      isValid = otpApiClient.verifyOtp(otpId, verifyRequest).block();
    } catch (Exception e) {
      log.error("Error verifying nominee OTP for otp_id {}: {}", otpId, e.getMessage(), e);
      throw new RuntimeException("Failed to verify OTP", e);
    }

    log.info("OTP verification result for otp_id {}: {}", otpId, isValid);
    return Boolean.TRUE.equals(isValid);
  }

  /**
   * Adds nominees for an investor
   *
   * @param investorId Investor ID
   * @param otpId OTP ID from verification
   * @param nomineeRequest Nominee request with nominees list
   * @return Nominee ID from Tarrakki
   */
  public String addNominees(Long investorId, String otpId, NomineeRequest nomineeRequest) {
    log.info("Adding nominees for investor ID: {}", investorId);

    Investor investor =
        investorRepository
            .findById(investorId)
            .orElseThrow(
                () -> new IllegalArgumentException("Investor not found with ID: " + investorId));

    if (investor.getRef() == null) {
      throw new IllegalStateException("Investor does not have a Tarrakki reference ID");
    }

    // Set auth_ref (OTP ID) and authenticator
    nomineeRequest.setAuth_ref(otpId);
    nomineeRequest.setAuthenticator("tarrakki");

    // Call Tarrakki API
    NomineeResponse response;
    try {
      response = investorAPIClient.addNominees(investor.getRef(), nomineeRequest).block();

      if (response == null || response.getNominee_id() == null) {
        throw new RuntimeException("Failed to add nominees: null response from Tarrakki API");
      }
    } catch (Exception e) {
      log.error("Error adding nominees for investor {}: {}", investorId, e.getMessage(), e);
      throw new RuntimeException("Failed to add nominees", e);
    }

    log.info(
        "Successfully added nominees for investor ID: {} with nominee_id: {}",
        investorId,
        response.getNominee_id());

    return response.getNominee_id();
  }
}
