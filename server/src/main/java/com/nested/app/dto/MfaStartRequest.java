package com.nested.app.dto;

import com.nested.app.enums.MfaChannel;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Request to start MFA session")
public class MfaStartRequest {

  @NotBlank(message = "Action is required")
  @Schema(description = "Action requiring MFA", example = "MF_BUY")
  private String action;

  @NotNull(message = "Channel is required")
  @Schema(description = "OTP delivery channel", example = "SMS")
  private MfaChannel channel;
}
