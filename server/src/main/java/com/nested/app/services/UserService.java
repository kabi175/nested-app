package com.nested.app.services;

import com.nested.app.dto.UserDTO;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public interface UserService {

  List<UserDTO> findAllUsers(Type type, Pageable pageable);

  UserDTO createUser(UserDTO userDTO);

  UserDTO updateUser(UserDTO userDTO);

  enum Type {
    CURRENT_USER,
    ALL,
    ACTIVE,
    INACTIVE
  }
}
