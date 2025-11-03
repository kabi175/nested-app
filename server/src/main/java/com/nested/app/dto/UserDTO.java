package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.entity.User;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
  // TODO: annotate all the DTO PK with @JsonFormat(shape = JsonFormat
  //  .Shape.STRING)
  @JsonFormat(shape = JsonFormat.Shape.STRING)
  private Long id;

  @NotNull
  @JsonProperty("first_name")
  private String firstName;

  @NotNull
  @JsonProperty("last_name")
  private String lastName;

  private String email;

  @JsonProperty("phone_number")
  private String phoneNumber;

  private String role;

  private AddressDto address;

  @NotNull(message = "Date of Birth is required")
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  @JsonProperty("date_of_birth")
  private java.util.Date dateOfBirth;

  @NotNull(message = "Gender is required")
  @Enumerated(EnumType.STRING)
  private User.Gender gender;

  @JsonProperty("pan_number")
  private String panNumber;

  private InvestorDto investor;

  public static UserDTO fromEntity(User entity) {
    return new UserDTO(
        entity.getId(),
        entity.getFirstName(),
        entity.getLastName(),
        entity.getEmail(),
        entity.getPhoneNumber(),
        entity.getRole().name().toLowerCase(),
        AddressDto.fromEntity(entity.getAddress()),
        entity.getDateOfBirth(),
        entity.getGender(),
        entity.getPanNumber(),
        InvestorDto.fromEntity(entity.getInvestor()));
  }

  public static User fromDto(UserDTO dto) {
    return User.builder()
        .id(dto.getId())
        .firstName(dto.getFirstName())
        .lastName(dto.getLastName())
        .email(dto.getEmail())
        .role(dto.getRole() != null ? User.Role.valueOf(dto.getRole().toUpperCase()) : null)
        .address(AddressDto.toEntity(dto.getAddress()))
        .dateOfBirth(dto.getDateOfBirth())
        .gender(dto.getGender())
        .panNumber(dto.getPanNumber())
        .build();
  }
}
