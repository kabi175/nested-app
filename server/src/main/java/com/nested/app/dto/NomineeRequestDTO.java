package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.enums.RelationshipType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for creating/updating Nominee Used for API requests to add or update nominee
 * information
 *
 * @author Nested App Team
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NomineeRequestDTO {

  private Long id;

  @NotNull(message = "Name is required")
  private String name;

  @NotNull(message = "Relationship is required")
  @JsonProperty("relationship")
  private RelationshipType relationship;

  @NotNull(message = "Date of birth is required")
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  private Date dob;

  @NotNull(message = "Allocation is required")
  @Min(value = 1, message = "Allocation must be at least 1")
  @Max(value = 100, message = "Allocation cannot exceed 100")
  private Integer allocation;

  @JsonProperty("pan")
  private String pan;

  @JsonProperty("email")
  private String email;

  @NotNull(message = "Mobile number is required")
  @JsonProperty("mobile_number")
  @Pattern(regexp = "^[0-9]{10}$", message = "Mobile number must be 10 digits")
  private String mobileNumber;

  @JsonProperty("address")
  private AddressDto address;

  @JsonProperty("guardian_name")
  private String guardianName;
}
