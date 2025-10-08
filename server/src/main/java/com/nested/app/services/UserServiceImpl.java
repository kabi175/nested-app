package com.nested.app.services;

import com.google.common.base.Strings;
import com.nested.app.client.tarrakki.InvestorAPIClient;
import com.nested.app.contect.UserContext;
import com.nested.app.dto.AddressDto;
import com.nested.app.dto.UserDTO;
import com.nested.app.entity.Address;
import com.nested.app.entity.User;
import com.nested.app.events.UserUpdateEvent;
import com.nested.app.repository.AddressRepository;
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

// TODO: Refer this update to update all other serives
@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

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

    if (updatedUser == originalUser) {
      log.info("No changes detected for userId={}, skipping update", userId);
      return UserDTO.fromEntity(originalUser);
    }
    User updated = userRepository.save(updatedUser);
    // publish event after successful update
    publisher.publishEvent(new UserUpdateEvent(originalUser, updatedUser));
    return UserDTO.fromEntity(updated);
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
