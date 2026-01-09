package com.nested.app.services;

import com.google.common.base.Strings;
import com.nested.app.client.meta.BankApiClient;
import com.nested.app.client.mf.InvestorAPIClient;
import com.nested.app.client.mf.KycAPIClient;
import com.nested.app.client.mf.dto.BankAccountRequest;
import com.nested.app.dto.AddressDto;
import com.nested.app.dto.BankAccountDto;
import com.nested.app.dto.UserActionRequest;
import com.nested.app.dto.UserDTO;
import com.nested.app.entity.Address;
import com.nested.app.entity.User;
import com.nested.app.events.UserUpdateEvent;
import com.nested.app.exception.ExternalServiceException;
import com.nested.app.exception.MfaException;
import com.nested.app.mapper.BankAccountTypeMapper;
import com.nested.app.repository.AddressRepository;
import com.nested.app.repository.BankDetailRepository;
import com.nested.app.repository.UserRepository;
import java.util.List;
import java.util.Objects;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.api.OpenApiResourceNotFoundException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final BankDetailRepository bankDetailRepository;
  private final UserRepository userRepository;
  private final AddressRepository addressRepository;
  private final InvestorAPIClient investorAPIClient;
  private final KycAPIClient kycAPIClient;
  private final ApplicationEventPublisher publisher;
  private final KycRedirectService kycRedirectService;
  private final BankApiClient bankApiClient;
  private final MfaService mfaService;

  @Override
  public List<UserDTO> findAllUsers(Type type, Pageable pageable, User user) {
    Stream<User> users =
        switch (type) {
          case CURRENT_USER -> userRepository.findById(user.getId()).stream();
          case ACTIVE -> userRepository.findByIsActive(true, pageable).stream();
          case INACTIVE -> userRepository.findByIsActive(false, pageable).stream();
          default -> userRepository.findAll(pageable).stream();
        };
    return users.map(UserDTO::fromEntity).toList();
  }

  @Override
  public UserDTO createUser(UserDTO userDTO) {
    // 1. Save user in DB
    User userEntity = UserDTO.fromDto(userDTO);
    User savedUser = userRepository.save(userEntity);

    return UserDTO.fromEntity(savedUser);
  }

  @Override
  public UserDTO updateUser(UserDTO userDTO, User user) {
    Long userId = userDTO.getId();

    if (userId == null) {
      throw new IllegalArgumentException("User ID must be provided for update");
    }

    User originalUser =
        userRepository
            .findById(userId)
            .orElseThrow(
                () ->
                    new OpenApiResourceNotFoundException("User with id " + userId + " not found"));

    User updatedUser = originalUser;

    if (!Strings.isNullOrEmpty(userDTO.getFirstName())
        && !Objects.equals(userDTO.getFirstName(), originalUser.getFirstName())) {
      updatedUser = originalUser.withFirstName(userDTO.getFirstName());
    }

    if (!Strings.isNullOrEmpty(userDTO.getLastName())
        && !Objects.equals(userDTO.getLastName(), originalUser.getLastName())) {
      updatedUser = originalUser.withLastName(userDTO.getLastName());
    }

    if (!Strings.isNullOrEmpty(userDTO.getEmail())
        && !Objects.equals(userDTO.getEmail(), originalUser.getEmail())) {
      updatedUser = originalUser.withEmail(userDTO.getEmail());
    }

    if (userDTO.getRole() != null
        && !Objects.equals(
            User.Role.valueOf(userDTO.getRole().toUpperCase()), originalUser.getRole())) {
      updatedUser = originalUser.withRole(User.Role.valueOf(userDTO.getRole().toUpperCase()));
    }

    if (userDTO.getAddress() != null) {
      if (originalUser.getAddress() == null) {
        var newAddress = new Address();
        updateAddressFields(newAddress, userDTO.getAddress());
        addressRepository.save(newAddress);
        updatedUser = updatedUser.withAddress(newAddress);
      } else {
        var oldAddress = originalUser.getAddress();
        updateAddressFields(oldAddress, userDTO.getAddress());
        addressRepository.save(oldAddress);
        updatedUser = updatedUser.withAddress(oldAddress);
      }

      if (updatedUser.getAddress().getCity() != null) {
        updatedUser = updatedUser.withBirthPlace(updatedUser.getAddress().getCity());
      }
    }

    if (userDTO.getDateOfBirth() != null
        && !Objects.equals(userDTO.getDateOfBirth(), originalUser.getDateOfBirth())) {
      updatedUser = updatedUser.withDateOfBirth(userDTO.getDateOfBirth());
    }

    if (userDTO.getGender() != null
        && !Objects.equals(userDTO.getGender(), originalUser.getGender())) {
      updatedUser = updatedUser.withGender(userDTO.getGender());
    }

    if (!Strings.isNullOrEmpty(userDTO.getPanNumber())
        && !Objects.equals(userDTO.getPanNumber(), originalUser.getPanNumber())) {
      updatedUser = updatedUser.withPanNumber(userDTO.getPanNumber());
    }

    if (!Strings.isNullOrEmpty(userDTO.getAadhaarLast4())
        && !Objects.equals(userDTO.getAadhaarLast4(), originalUser.getAadhaarLast4())) {
      updatedUser = updatedUser.withAadhaarLast4(userDTO.getAadhaarLast4());
    }

    if (!Strings.isNullOrEmpty(userDTO.getFatherName())
        && !Objects.equals(userDTO.getFatherName(), originalUser.getFatherName())) {
      updatedUser = updatedUser.withFatherName(userDTO.getFatherName());
    }

    if (!Strings.isNullOrEmpty(userDTO.getBirthPlace())
        && !Objects.equals(userDTO.getBirthPlace(), originalUser.getBirthPlace())) {
      updatedUser = updatedUser.withBirthPlace(userDTO.getBirthPlace());
    }

    if (userDTO.getIncomeSource() != null
        && !Objects.equals(userDTO.getIncomeSource(), originalUser.getIncomeSource())) {
      updatedUser = updatedUser.withIncomeSource(userDTO.getIncomeSource());
    }

    if (userDTO.getIncomeSlab() != null
        && !Objects.equals(userDTO.getIncomeSlab(), originalUser.getIncomeSlab())) {
      updatedUser = updatedUser.withIncomeSlab(userDTO.getIncomeSlab());
    }

    if (userDTO.getOccupation() != null
        && !Objects.equals(userDTO.getOccupation(), originalUser.getOccupation())) {
      updatedUser = updatedUser.withOccupation(userDTO.getOccupation());
    }

    if (userDTO.isPep() != originalUser.isPep()) {
      updatedUser = updatedUser.withPep(userDTO.isPep());
    }

    if (userDTO.getMaritalStatus() != null
        && !Objects.equals(userDTO.getMaritalStatus(), originalUser.getMaritalStatus())) {
      updatedUser = updatedUser.withMaritalStatus(userDTO.getMaritalStatus());
    }

    if (updatedUser == originalUser) {
      log.info("No changes detected for userId={}, skipping update", userId);
      return UserDTO.fromEntity(originalUser);
    }
    User updated = userRepository.save(updatedUser);

    // publish event after successful update
    publisher.publishEvent(new UserUpdateEvent(originalUser, updatedUser));
    return UserDTO.fromEntity(updated);
  }

  @Override
  public BankAccountDto addBankAccount(Long userID, BankAccountDto bankAccountDto) {
    var bank = bankAccountDto.toEntity();

    var user =
        userRepository
            .findById(userID)
            .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userID));
    bank.setUser(user);

    if (!user.isReadyToInvest()) {
      throw new IllegalArgumentException("Complete KYC before adding bank details");
    }

    try {
      var ifscData = bankApiClient.fetchIfscData(bank.getIfscCode()).block();

      if (ifscData == null) {
        throw new IllegalArgumentException("Invalid IFSC code");
      }

      bank.setBankName(ifscData.getBankName());
    } catch (Exception e) {
      throw new IllegalArgumentException("Invalid IFSC code");
    }

    var request =
        BankAccountRequest.builder()
            .investorID(user.getInvestor().getRef())
            .accountNumber(bankAccountDto.getAccountNumber())
            .ifsc(bankAccountDto.getIfsc())
            .accountType(BankAccountTypeMapper.toDtoAccountType(bankAccountDto.getAccountType()))
            .holderName(user.getFullName())
            .build();
    var resp = investorAPIClient.addBankAccount(request).block();
    if (resp == null) {
      throw new IllegalArgumentException("Invalid Bank Details");
    }
    bank.setRefId(resp.getBankId());
    bank.setPaymentRef(resp.getPaymentRef());

    bank = bankDetailRepository.save(bank);

    investorAPIClient
        .addPrimaryBankAccount(user.getInvestor().getAccountRef(), bank.getRefId())
        .block();

    return BankAccountDto.fromEntity(bankDetailRepository.findById(bank.getId()).orElseThrow());
  }

  @Override
  public List<BankAccountDto> fetchBankAccounts(Long userID) {
    var bankAccounts = bankDetailRepository.findAllByUserId(userID);
    return bankAccounts.stream().map(BankAccountDto::fromEntity).toList();
  }

  @Override
  public void deleteBankAccount(Long userID, Long bankAccountID) {
    throw new UnsupportedOperationException("Bank account deletion is not supported");
  }

  @Override
  public void uploadUserSignature(Long userId, MultipartFile file) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(
                () ->
                    new OpenApiResourceNotFoundException("User with id " + userId + " not found"));

    var resp = investorAPIClient.uploadDocument("signature", file).block();
    if (resp == null || resp.getId() == null) {
      throw new ExternalServiceException("Failed to upload signature document to external service");
    }

    user = user.withSignatureFileID(resp.getId());
    userRepository.save(user);
  }

  @Override
  public String fetchUserSignature(Long userId) {
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(
                () ->
                    new OpenApiResourceNotFoundException("User with id " + userId + " not found"));

    if (user.getSignatureFileID() == null) {
      throw new OpenApiResourceNotFoundException("Signature not found for user with id " + userId);
    }

    var resp = investorAPIClient.fetchDocument(user.getSignatureFileID()).block();

    if (resp == null || resp.getUrl() == null) {
      throw new ExternalServiceException(
          "Failed to fetch signature document from external service");
    }

    return resp.getUrl();
  }

  @Override
  public UserActionRequest createAadhaarUploadRequest(Long userId) {
    // Verify user exists
    var user =
        userRepository
            .findById(userId)
            .orElseThrow(
                () ->
                    new OpenApiResourceNotFoundException("User with id " + userId + " not found"));

    var kycRequestId = user.getInvestor().getKycRequestRef();
    // Call KycAPIClient to create Aadhaar upload request
    var actionRequired =
        kycAPIClient.createAadhaarUploadRequest(user.getInvestor().getKycRequestRef()).block();

    if (actionRequired == null) {
      throw new ExternalServiceException(
          "Failed to create Aadhaar upload request from KYC service");
    }

    if (actionRequired.isCompleted()) {

      var isSuccess = kycAPIClient.updateAadhaarProof(kycRequestId).block();
      if (Boolean.TRUE.equals(isSuccess)) {
        user.setKycStatus(User.KYCStatus.E_SIGN_PENDING);
        userRepository.save(user);
      }
      return null;
    }

    if (actionRequired.getRedirectUrl() == null) {
      throw new ExternalServiceException(
          "Failed to create Aadhaar upload request " + "url" + " from KYC service");
    }

    log.info(
        "Aadhaar upload request created for user ID: {} with KYC request ID: {}",
        userId,
        kycRequestId);

    // Return UserActionRequest with details from the KYC service
    return UserActionRequest.builder()
        .id(String.valueOf(userId))
        .type("aadhaar_upload")
        .redirectUrl(actionRequired.getRedirectUrl())
        .build();
  }

  @Override
  public UserActionRequest createEsignUploadRequest(Long userId) {
    // Verify user exists
    User user =
        userRepository
            .findById(userId)
            .orElseThrow(
                () ->
                    new OpenApiResourceNotFoundException("User with id " + userId + " not found"));

    var kycRequestId = user.getInvestor().getKycRequestRef();

    // Call KycAPIClient to create eSign upload request
    var actionRequired = kycAPIClient.createESignRequest(kycRequestId).block();

    if (actionRequired == null || actionRequired.getId() == null) {
      throw new ExternalServiceException("Failed to create eSign upload request from KYC service");
    }

    if (actionRequired.isCompleted()) {
      kycRedirectService.handleESignRedirect(kycRequestId);
      return null;
    }

    log.info(
        "eSign upload request created for user ID: {} with KYC request ID: {}",
        userId,
        kycRequestId);

    // Update investor with eSign request reference
    user.getInvestor().setESignRequestRef(actionRequired.getId());
    userRepository.save(user);

    // Return UserActionRequest with details from the KYC service
    return UserActionRequest.builder()
        .id(String.valueOf(userId))
        .type("esign_upload")
        .redirectUrl(actionRequired.getRedirectUrl())
        .build();
  }

  @Override
  public UserDTO updateEmail(String userId, String newEmail, String mfaToken) {
    // Validate MFA token
    if (!mfaService.validateMfaToken(mfaToken, "EMAIL_UPDATE")) {
      throw new MfaException("Invalid or expired MFA token");
    }

    // Find user by Firebase UID
    User user =
        userRepository
            .findByFirebaseUid(userId)
            .orElseThrow(
                () ->
                    new OpenApiResourceNotFoundException(
                        "User with Firebase UID " + userId + " not found"));

    // Check if email is already in use by another user
    final Long userIdLong = user.getId();
    userRepository
        .findByEmail(newEmail)
        .ifPresent(
            existingUser -> {
              if (!existingUser.getId().equals(userIdLong)) {
                throw new IllegalArgumentException("Email address is already in use");
              }
            });

    // Store original user for event
    User originalUser = user;

    // Update email in database
    user = user.withEmail(newEmail);
    user = userRepository.save(user);

    // Publish event after successful update
    publisher.publishEvent(new UserUpdateEvent(originalUser, user));

    log.info("Email updated successfully for user: {}, new email: {}", userId, newEmail);
    return UserDTO.fromEntity(user);
  }

  private void updateAddressFields(Address address, AddressDto addressDto) {
    if (addressDto.getAddressLine() != null) {
      address.setAddressLine(addressDto.getAddressLine());
    }
    if (addressDto.getCity() != null) {
      address.setCity(addressDto.getCity());
    }
    if (addressDto.getState() != null) {
      address.setState(addressDto.getState());
    }
    if (addressDto.getCountry() != null) {
      address.setCountry(addressDto.getCountry());
    }
    if (addressDto.getPinCode() != null) {
      address.setPinCode(addressDto.getPinCode());
    }
  }
}
