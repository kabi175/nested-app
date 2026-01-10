package com.nested.app.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to update user email address")
public class EmailUpdateRequest {

  @NotBlank(message = "Email is required")
  @Email(message = "Invalid email format")
  @Schema(description = "New email address", example = "user@example.com", required = true)
  private String email;
}
