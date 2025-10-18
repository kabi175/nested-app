package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Data Transfer Object for order verification Used for the verify_order API endpoint
 *
 * @author Nested App Team
 * @version 1.0
 */
@Data
public class VerifyOrderDTO {

  @NotNull(message = "Order ID is required")
  @JsonFormat(shape = JsonFormat.Shape.STRING)
  private Long id;

  @NotNull(message = "Verification code is required")
  @JsonProperty("verification_code")
  private String verificationCode;
}
