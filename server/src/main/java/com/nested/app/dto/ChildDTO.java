package com.nested.app.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class ChildDTO {
  private String id;
  private String firstName;
  private String lastName;
  private LocalDate dob;
  private String gender;
  private boolean investUnderChild;
  private MinifiedUserDTO user;
}
