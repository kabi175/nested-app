package com.nested.app.services;

import com.google.common.base.Strings;
import com.nested.app.client.mf.InvestorAPIClient;
import com.nested.app.contect.UserContext;
import com.nested.app.dto.AddressDto;
import com.nested.app.dto.BankAccountDto;
import com.nested.app.dto.UserDTO;
import com.nested.app.entity.Address;
import com.nested.app.entity.User;
import com.nested.app.events.UserUpdateEvent;
import com.nested.app.repository.AddressRepository;
import com.nested.app.repository.BankDetailRepository;
import com.nested.app.repository.UserRepository;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.api.OpenApiResourceNotFoundException;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

// TODO: Refer this update to update all other serives
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final BankDetailRepository bankDetailRepository;
  private final UserRepository userRepository;
  private final AddressRepository addressRepository;
  private final InvestorAPIClient investorAPIClient;
  private final UserContext userContext;
  private final ApplicationEventPublisher publisher;

  @Override
  public List<UserDTO> findAllUsers(Type type, Pageable pageable) {
    Stream<User> users =
        switch (type) {
          case CURRENT_USER -> userRepository.findById(userContext.getUser().getId()).stream();
          case ACTIVE -> userRepository.findByIsActive(true, pageable).stream();
          case INACTIVE -> userRepository.findByIsActive(false, pageable).stream();
          default -> userRepository.findAll(pageable).stream();
        };
    return users.map(UserDTO::fromEntity).collect(Collectors.toList());
  }

  @Override
  public UserDTO createUser(UserDTO userDTO) {
    // 1. Save user in DB
    User user = UserDTO.fromDto(userDTO);
    User savedUser = userRepository.save(user);

    return UserDTO.fromEntity(savedUser);
  }

  // TODO: sync the username & email to firebase auth as well
  @Override
  public UserDTO updateUser(UserDTO userDTO) {
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

    if (userDTO.getDateOfBirth() != null) {
      if (!Objects.equals(userDTO.getDateOfBirth(), originalUser.getDateOfBirth())) {
        updatedUser = updatedUser.withDateOfBirth(userDTO.getDateOfBirth());
      }
    }

    if (userDTO.getGender() != null) {
      if (!Objects.equals(userDTO.getGender(), originalUser.getGender())) {
        updatedUser = updatedUser.withGender(userDTO.getGender());
      }
    }

    if (!Strings.isNullOrEmpty(userDTO.getPanNumber())
        && !Objects.equals(userDTO.getPanNumber(), originalUser.getPanNumber())) {
      updatedUser = updatedUser.withPanNumber(userDTO.getPanNumber());
    }

    if (!Strings.isNullOrEmpty(userDTO.getAadhaarLast4())
        && !Objects.equals(userDTO.getAadhaarLast4(), originalUser.getAadhaarLast4())) {
      updatedUser = originalUser.withAadhaarLast4(userDTO.getAadhaarLast4());
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

    bank = bankDetailRepository.save(bank);

    return BankAccountDto.fromEntity(bankDetailRepository.findById(bank.getId()).orElseThrow());
  }

  @Override
  public List<BankAccountDto> fetchBankAccounts(Long userID) {
    var bankAccounts = bankDetailRepository.findAllByUserId(userID);
    return bankAccounts.stream().map(BankAccountDto::fromEntity).toList();
  }

  @Override
  public void deleteBankAccount(Long userID, Long bankAccountID) {
    var bankAccount = bankDetailRepository.findById(bankAccountID).orElseThrow();
    bankDetailRepository.delete(bankAccount);
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
      throw new RuntimeException("Failed to upload signature document to external service");
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
      throw new RuntimeException("Failed to fetch signature document from external service");
    }

    return resp.getUrl();
  }

  private String getExtension(String filename) {
    if (filename == null) return "";
    int dot = filename.lastIndexOf('.');
    return (dot == -1) ? "" : filename.substring(dot + 1);
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
