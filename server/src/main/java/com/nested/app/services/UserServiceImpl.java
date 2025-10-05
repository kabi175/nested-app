package com.nested.app.services;

import com.google.common.base.Strings;
import com.nested.app.contect.UserContext;
import com.nested.app.dto.UserDTO;
import com.nested.app.entity.User;
import com.nested.app.events.UserUpdateEvent;
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

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final UserRepository userRepository;
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


  @Override
  public UserDTO updateUser(UserDTO userDTO) {
    Long userId = userDTO.getId() != null ? Long.parseLong(userDTO.getId()) : null;

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
    if (!Strings.isNullOrEmpty(userDTO.getEmail())
        && !Objects.equals(userDTO.getEmail(), originalUser.getEmail())) {
      updatedUser = originalUser.withEmail(userDTO.getEmail());
    }

    if (!Strings.isNullOrEmpty(userDTO.getName())
        && !Objects.equals(userDTO.getName(), originalUser.getName())) {
      updatedUser = originalUser.withName(userDTO.getName());
    }

    if (userDTO.getRole() != null
        && !Objects.equals(
            User.Role.valueOf(userDTO.getRole().toUpperCase()), originalUser.getRole())) {
      updatedUser = originalUser.withRole(User.Role.valueOf(userDTO.getRole().toUpperCase()));
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


}
