package com.nested.app.services;

import com.nested.app.contect.UserContext;
import com.nested.app.dto.UserDto;
import com.nested.app.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
  private final UserContext userContext;
  private final UserRepository userRepository;

  public List<UserDto> findAllUsers(Type type, Pageable pageable) {
    return userRepository.findAll(pageable).get().map(UserDto::fromEntity).toList();
  }

  public enum Type {
    CURRENT_USER,
    ALL,
    ACTIVE,
    INACTIVE
  }
}
