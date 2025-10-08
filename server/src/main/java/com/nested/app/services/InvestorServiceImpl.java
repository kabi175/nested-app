package com.nested.app.services;

import com.nested.app.client.tarrakki.InvestorAPIClient;
import com.nested.app.client.tarrakki.OtpApiClient;
import com.nested.app.client.tarrakki.dto.BankResponse;
import com.nested.app.client.tarrakki.dto.InvestorResponse;
import com.nested.app.client.tarrakki.dto.NomineeRequest;
import com.nested.app.client.tarrakki.dto.NomineeResponse;
import com.nested.app.client.tarrakki.dto.OtpRequest;
import com.nested.app.client.tarrakki.dto.OtpResponse;
import com.nested.app.client.tarrakki.dto.OtpVerifyRequest;
import com.nested.app.client.tarrakki.dto.TarrakkiInvestorRequest;
import com.nested.app.entity.Child;
import com.nested.app.entity.Investor;
import com.nested.app.entity.User;
import com.nested.app.repository.ChildRepository;
import com.nested.app.repository.InvestorRepository;
import com.nested.app.repository.UserRepository;
import java.time.LocalDate;
import java.time.ZoneId;
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
public class InvestorServiceImpl {

  private final InvestorAPIClient investorAPIClient;
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
    TarrakkiInvestorRequest request = buildInvestorRequestFromUser(user);

    // Call Tarrakki API
    InvestorResponse response;
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
    Investor investor = new Investor();
    investor.setInvestorType("individual");
    investor.setTarakkiInvestorRef(response.getId());
    investor.setInvestorStatus(Investor.Status.fromValue(response.getStatus()));

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

    // Validate required fields
    validateChildForInvestorCreation(child, parentUser);

    // Build Tarrakki request (using child's personal data + parent's other data)
    TarrakkiInvestorRequest request = buildInvestorRequestFromChild(child, parentUser);

    // Call Tarrakki API
    InvestorResponse response;
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
    Investor investor = new Investor();
    investor.setInvestorType("minor");
    investor.setTarakkiInvestorRef(response.getId());
    investor.setInvestorStatus(Investor.Status.fromValue(response.getStatus()));

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
  private TarrakkiInvestorRequest buildInvestorRequestFromUser(User user) {
    TarrakkiInvestorRequest request = new TarrakkiInvestorRequest();

    request.setInvestor_type(TarrakkiInvestorRequest.InvestorType.INDIVIDUAL);

    // Split name into first and last name
    request.setFirst_name(user.getFirstName());
    request.setLast_name(user.getLastName());

    // Convert Date to LocalDate
    LocalDate dob = user.getDateOfBirth().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
    request.setDob(dob);

    // Map gender
    request.setGender(mapGenderToTarrakki(user.getGender()));

    request.setPan(user.getPanNumber());
    request.setEmail(user.getEmail());

    // Format phone number (remove +91 or 91 prefix if present)
    String mobile = formatPhoneNumber(user.getPhoneNumber());
    request.setMobile(mobile);

    // Map address
    TarrakkiInvestorRequest.AddressDTO address = new TarrakkiInvestorRequest.AddressDTO();
    address.setAddress_line_1(user.getAddress().getAddressLine());
    address.setAddress_line_2("");
    address.setAddress_line_3("");
    address.setCity(user.getAddress().getCity());
    address.setState(user.getAddress().getState());
    address.setCountry(user.getAddress().getCountry());
    address.setPincode(user.getAddress().getPinCode());
    request.setAddress(address);

    request.setEmail_declaration("self");
    request.setMobile_declaration("self");

    // Map FATCA details
    TarrakkiInvestorRequest.FatcaDetailDTO fatca = new TarrakkiInvestorRequest.FatcaDetailDTO();
    fatca.setOccupation(user.getOccupation().name().toLowerCase());
    fatca.setIncome_source(user.getIncomeSource().name().toLowerCase());
    fatca.setIncome_slab(user.getIncomeSlab().name().toLowerCase());
    fatca.setBirth_place(user.getBirthPlace());
    fatca.setBirth_country(user.getBirthCountry());
    request.setFatca_detail(fatca);

    return request;
  }

  /** Builds Tarrakki investor request from Child entity (using parent's data for most fields) */
  private TarrakkiInvestorRequest buildInvestorRequestFromChild(Child child, User parentUser) {
    TarrakkiInvestorRequest request = new TarrakkiInvestorRequest();

    request.setInvestor_type(TarrakkiInvestorRequest.InvestorType.MINOR);

    // Use child's name and DOB
    request.setFirst_name(child.getFirstName());
    request.setLast_name(child.getLastName() != null ? child.getLastName() : "");

    // Convert Date to LocalDate
    LocalDate dob = child.getDateOfBirth().toLocalDate();
    request.setDob(dob);

    // Map child's gender
    request.setGender(mapGenderToTarrakki(child.getGender()));

    // Use parent's data for remaining fields
    request.setPan(parentUser.getPanNumber());
    request.setEmail(parentUser.getEmail());

    String mobile = formatPhoneNumber(parentUser.getPhoneNumber());
    request.setMobile(mobile);

    // Map parent's address
    TarrakkiInvestorRequest.AddressDTO address = new TarrakkiInvestorRequest.AddressDTO();
    address.setAddress_line_1(parentUser.getAddress().getAddressLine());
    address.setAddress_line_2("");
    address.setAddress_line_3("");
    address.setCity(parentUser.getAddress().getCity());
    address.setState(parentUser.getAddress().getState());
    address.setCountry(parentUser.getAddress().getCountry());
    address.setPincode(parentUser.getAddress().getPinCode());
    request.setAddress(address);

    request.setEmail_declaration("guardian");
    request.setMobile_declaration("guardian");

    // Map parent's FATCA details
    TarrakkiInvestorRequest.FatcaDetailDTO fatca = new TarrakkiInvestorRequest.FatcaDetailDTO();
    fatca.setOccupation(parentUser.getOccupation().name().toLowerCase());
    fatca.setIncome_source(parentUser.getIncomeSource().name().toLowerCase());
    fatca.setIncome_slab(parentUser.getIncomeSlab().name().toLowerCase());
    fatca.setBirth_place(parentUser.getBirthPlace());
    fatca.setBirth_country(parentUser.getBirthCountry());
    request.setFatca_detail(fatca);

    return request;
  }

  /** Maps User.Gender enum to Tarrakki Gender enum */
  private TarrakkiInvestorRequest.Gender mapGenderToTarrakki(User.Gender gender) {
    return switch (gender) {
      case User.Gender.MALE -> TarrakkiInvestorRequest.Gender.MALE;
      case User.Gender.FEMALE -> TarrakkiInvestorRequest.Gender.FEMALE;
      default -> TarrakkiInvestorRequest.Gender.TRANSGENDER;
    };
  }

  /** Formats phone number by removing country code prefix */
  private String formatPhoneNumber(String phoneNumber) {
    if (phoneNumber == null) {
      return "";
    }
    String mobile = phoneNumber;
    if (mobile.startsWith("+91")) {
      mobile = mobile.substring(3);
    } else if (mobile.startsWith("91") && mobile.length() > 10) {
      mobile = mobile.substring(2);
    }
    return mobile.trim();
  }

  /**
   * Adds a bank account for an investor
   *
   * @param investorId Investor ID
   * @param accountType Account type (savings/current)
   * @param accountNumber Bank account number
   * @param ifsc IFSC code
   * @param verificationDocument Document type
   * @param file Verification document file
   * @return Bank ID from Tarrakki
   */
  public String addBankAccount(
      Long investorId,
      String accountType,
      String accountNumber,
      String ifsc,
      String verificationDocument,
      MultipartFile file) {
    log.info("Adding bank account for investor ID: {}", investorId);

    Investor investor =
        investorRepository
            .findById(investorId)
            .orElseThrow(
                () -> new IllegalArgumentException("Investor not found with ID: " + investorId));

    if (investor.getTarakkiInvestorRef() == null) {
      throw new IllegalStateException("Investor does not have a Tarrakki reference ID");
    }

    // Validate file
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("Verification document file is required");
    }

    // Call Tarrakki API
    BankResponse response;
    try {
      response =
          investorAPIClient
              .addBankForInvestor(
                  investor.getTarakkiInvestorRef(),
                  accountType.toLowerCase(),
                  accountNumber,
                  ifsc,
                  verificationDocument.toLowerCase(),
                  file)
              .block();

      if (response == null || response.getBank_id() == null) {
        throw new RuntimeException("Failed to add bank account: null response from Tarrakki API");
      }
    } catch (Exception e) {
      log.error("Error adding bank account for investor {}: {}", investorId, e.getMessage(), e);
      throw new RuntimeException("Failed to add bank account", e);
    }

    log.info(
        "Successfully added bank account for investor ID: {} with bank_id: {}",
        investorId,
        response.getBank_id());

    return response.getBank_id();
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

    if (investor.getTarakkiInvestorRef() == null) {
      throw new IllegalStateException("Investor does not have a Tarrakki reference ID");
    }

    // Validate file
    if (file == null || file.isEmpty()) {
      throw new IllegalArgumentException("Document file is required");
    }

    // Call Tarrakki API
    try {
      investorAPIClient
          .uploadDocumentForInvestor(
              investor.getTarakkiInvestorRef(), documentType.toLowerCase(), file)
          .block();
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

    if (investor.getTarakkiInvestorRef() == null) {
      throw new IllegalStateException("Investor does not have a Tarrakki reference ID");
    }

    // Create OTP request
    OtpRequest otpRequest = new OtpRequest();
    otpRequest.setInvestor_id(investor.getTarakkiInvestorRef());
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
        response.getOtp_id());

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

    if (investor.getTarakkiInvestorRef() == null) {
      throw new IllegalStateException("Investor does not have a Tarrakki reference ID");
    }

    // Set auth_ref (OTP ID) and authenticator
    nomineeRequest.setAuth_ref(otpId);
    nomineeRequest.setAuthenticator("tarrakki");

    // Call Tarrakki API
    NomineeResponse response;
    try {
      response =
          investorAPIClient
              .addNomineesForInvestor(investor.getTarakkiInvestorRef(), nomineeRequest)
              .block();

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
