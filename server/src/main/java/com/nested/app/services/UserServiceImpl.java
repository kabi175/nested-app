package com.nested.app.services;

import com.nested.app.contect.UserContext;
import com.nested.app.dto.UserDTO;
import com.nested.app.entity.User;
import com.nested.app.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
  private final UserRepository userRepository;
  private final UserContext userContext;

  @Override
  public List<UserDTO> findAllUsers(Type type, Pageable pageable) {
    Stream<User> users;
    switch (type) {
      case CURRENT_USER:
        users = userRepository.findById(userContext.getUser().getId()).stream();
        break;
      case ACTIVE:
        users = userRepository.findByIsActive(true, pageable).stream();
        break;
      case INACTIVE:
        users = userRepository.findByIsActive(false, pageable).stream();
        break;
      case ALL:
      default:
        users = userRepository.findAll(pageable).stream();
    }
    return users.map(UserDTO::fromEntity).collect(Collectors.toList());
  }

  @Override
  public UserDTO createUser(UserDTO userDTO) {
    User user = UserDTO.fromDto(userDTO);
    User saved = userRepository.save(user);
    return UserDTO.fromEntity(saved);
  }

  @Override
  public UserDTO updateUser(UserDTO userDTO) {
    User user =
        userRepository
            .findById(userDTO.getId() != null ? Long.parseLong(userDTO.getId()) : null)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
    user.setName(userDTO.getName());
    user.setEmail(userDTO.getEmail());
    user.setPhoneNumber(userDTO.getPhoneNumber());
    if (userDTO.getRole() != null) {
      user.setRole(User.Role.valueOf(userDTO.getRole().toUpperCase()));
    }
    User updated = userRepository.save(user);
    return UserDTO.fromEntity(updated);
  }
}
