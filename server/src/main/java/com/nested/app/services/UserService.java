package com.nested.app.services;

import com.nested.app.dto.BankAccountDto;
import com.nested.app.dto.UserActionRequest;
import com.nested.app.dto.UserDTO;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public interface UserService {

  List<UserDTO> findAllUsers(Type type, Pageable pageable, com.nested.app.entity.User user);

  UserDTO createUser(UserDTO userDTO);

  UserDTO updateUser(UserDTO userDTO, com.nested.app.entity.User user);

  BankAccountDto addBankAccount(Long userID, BankAccountDto bankAccountDto);

  List<BankAccountDto> fetchBankAccounts(Long userID);

  void deleteBankAccount(Long userID, Long bankAccountID);

  void uploadUserSignature(Long userId, MultipartFile file);

  String fetchUserSignature(Long userId);

  UserActionRequest createAadhaarUploadRequest(Long userId);

  UserActionRequest createEsignUploadRequest(Long userId);

  enum Type {
    CURRENT_USER,
    ALL,
    ACTIVE,
    INACTIVE
  }
}
