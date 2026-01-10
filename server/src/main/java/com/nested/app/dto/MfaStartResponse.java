package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Response after starting MFA session")
public class MfaStartResponse {

  @JsonFormat(shape = JsonFormat.Shape.STRING)
  @Schema(description = "MFA session ID", example = "123e4567-e89b-12d3-a456-426614174000")
  private UUID mfaSessionId;

  @Schema(description = "Message", example = "OTP sent successfully")
  private String message;
}
