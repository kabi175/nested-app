package com.nested.app.dto;

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
  private String firstName;
  private String lastName;
  private Date dateOfBirth;
  private String gender;
  private boolean investUnderChild;
  private Long userId;
  private Timestamp createdAt;
  private Timestamp updatedAt;
}
