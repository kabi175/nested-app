package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.entity.User;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotEmpty;
import java.sql.Date;
import java.sql.Timestamp;
import lombok.Data;

/**
 * Data Transfer Object for Child entity
 * Used for API requests and responses to transfer child data
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Data
public class ChildDTO {
  
  private Long id;

  @NotEmpty private String firstName;
  private String lastName;

  @NotEmpty
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  @JsonProperty("date_of_birth")
  private Date dateOfBirth;

  @NotEmpty
  @Enumerated(EnumType.STRING)
  private User.Gender gender;

  @NotEmpty private boolean investUnderChild = false;

  private Timestamp createdAt;

  private Timestamp updatedAt;
}
