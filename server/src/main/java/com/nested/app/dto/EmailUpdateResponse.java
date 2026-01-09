package com.nested.app.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response after email update")
public class EmailUpdateResponse {

  @Schema(description = "Success message", example = "Email updated successfully")
  private String message;

  @Schema(description = "Updated email address", example = "user@example.com")
  private String email;
}
