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
    return User.builder()
        .id(dto.getId() != null ? Long.parseLong(dto.getId()) : null)
        .name(dto.getName())
        .email(dto.getEmail())
        .role(dto.getRole() != null ? User.Role.valueOf(dto.getRole().toUpperCase()) : null)
        .build();
  }
}
