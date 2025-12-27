package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.enums.RelationshipType;
import java.sql.Timestamp;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for Nominee response Used for API responses to return nominee information
 * (excludes internal 'ref' field)
 *
 * @author Nested App Team
 * @version 1.0
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NomineeResponseDTO {

  private Long id;

  private String name;

  @JsonProperty("relationship")
  private RelationshipType relationship;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  private Date dob;

  private String pan;

  private String email;

  @JsonProperty("mobile_number")
  private String mobileNumber;

  private AddressDto address;

  @JsonProperty("guardian_name")
  private String guardianName;

  private Integer allocation;

  @JsonProperty("is_minor")
  private Boolean isMinor;

  @JsonProperty("created_at")
  private Timestamp createdAt;

  @JsonProperty("updated_at")
  private Timestamp updatedAt;
}
