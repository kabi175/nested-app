package com.nested.app.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response after verifying MFA OTP")
public class MfaVerifyResponse {

  @Schema(
      description = "MFA token for authenticated requests",
      example = "user123.MF_BUY.session456.signature")
  private String mfaToken;

  @Schema(description = "Message", example = "MFA verification successful")
  private String message;
}
