package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.entity.User;
import com.nested.app.enums.IncomeSlab;
import com.nested.app.enums.IncomeSource;
import com.nested.app.enums.Occupation;
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

  @JsonProperty("aadhaar_last4")
  private String aadhaarLast4;

  @JsonProperty("signature_file_id")
  private String signatureFileID;

  @JsonProperty("father_name")
  private String fatherName;

  @JsonProperty("birth_place")
  private String birthPlace;

  @Enumerated(EnumType.STRING)
  @JsonProperty("income_source")
  private IncomeSource incomeSource;

  @Enumerated(EnumType.STRING)
  @JsonProperty("income_slab")
  private IncomeSlab incomeSlab;

  @Enumerated(EnumType.STRING)
  private Occupation occupation;

  @JsonProperty("is_pep")
  private boolean isPep;

  @JsonProperty("kyc_status")
  private User.KYCStatus kycStatus;

  @Enumerated(EnumType.STRING)
  @JsonProperty("marital_status")
  private User.MaritalStatus maritalStatus;

  public static UserDTO fromEntity(User entity) {
    UserDTO dto = new UserDTO();
    dto.setId(entity.getId());
    dto.setFirstName(entity.getFirstName());
    dto.setLastName(entity.getLastName());
    dto.setEmail(entity.getEmail());
    dto.setPhoneNumber(entity.getPhoneNumber());
    dto.setRole(entity.getRole().name().toLowerCase());
    dto.setAddress(AddressDto.fromEntity(entity.getAddress()));
    dto.setDateOfBirth(entity.getDateOfBirth());
    dto.setGender(entity.getGender());
    dto.setPanNumber(entity.getPanNumber());
    dto.setAadhaarLast4(entity.getAadhaarLast4());
    dto.setSignatureFileID(entity.getSignatureFileID());
    dto.setFatherName(entity.getFatherName());
    dto.setBirthPlace(entity.getBirthPlace());
    dto.setIncomeSource(entity.getIncomeSource());
    dto.setIncomeSlab(entity.getIncomeSlab());
    dto.setOccupation(entity.getOccupation());
    dto.setPep(entity.isPep());
    dto.setKycStatus(entity.getKycStatus());
    dto.setMaritalStatus(entity.getMaritalStatus());
    return dto;
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
        .aadhaarLast4(dto.getAadhaarLast4())
        .fatherName(dto.getFatherName())
        .birthPlace(dto.getBirthPlace())
        .incomeSource(dto.getIncomeSource())
        .incomeSlab(dto.getIncomeSlab())
        .occupation(dto.getOccupation())
        .isPep(dto.isPep())
        .maritalStatus(dto.getMaritalStatus())
        .build();
  }
}
