package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
  private String id;

  private String name;

  private String email;

  @JsonProperty("phone_number")
  private String phoneNumber;

  private String role;

  public static UserDTO fromEntity(User entity) {
    return new UserDTO(
        entity.getId().toString(),
        entity.getName(),
        entity.getEmail(),
        entity.getPhoneNumber(),
        entity.getRole().name().toLowerCase());
  }

  public static User fromDto(UserDTO dto) {
    User user = new User();
    user.setId(dto.getId() != null ? Long.parseLong(dto.getId()) : null);
    user.setName(dto.getName());
    user.setEmail(dto.getEmail());
    user.setPhoneNumber(dto.getPhoneNumber());
    if (dto.getRole() != null) {
      user.setRole(User.Role.valueOf(dto.getRole().toUpperCase()));
    }
    return user;
  }
}
