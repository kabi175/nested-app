package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Data Transfer Object for order verification Used for the verify_order API endpoint
 *
 * @author Nested App Team
 * @version 1.0
 */
@Data
public class VerifyOrderDTO {

  @NotBlank(message = "Order ID is required")
  private Long id;

  @NotBlank(message = "Verification code is required")
  @JsonProperty("verification_code")
  private String verificationCode;
}
