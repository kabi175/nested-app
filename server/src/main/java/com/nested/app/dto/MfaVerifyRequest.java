package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to verify MFA OTP")
public class MfaVerifyRequest {

  @NotNull(message = "MFA session ID is required")
  @JsonFormat(shape = JsonFormat.Shape.STRING)
  @Schema(description = "MFA session ID", example = "123e4567-e89b-12d3-a456-426614174000")
  private UUID mfaSessionId;

  @NotBlank(message = "OTP is required")
  @Pattern(regexp = "^[0-9]{6}$", message = "OTP must be 6 digits")
  @Schema(description = "6-digit OTP", example = "123456")
  private String otp;
}
