package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class OtpResponse {
  @JsonProperty("otp_type")
  private String otpType;

  @JsonProperty("investor_id")
  private String investorId;

  @JsonProperty("otp_id")
  private String otpId;

  private LocalDateTime expiry;

  private String email;
  private String mobile;
}
