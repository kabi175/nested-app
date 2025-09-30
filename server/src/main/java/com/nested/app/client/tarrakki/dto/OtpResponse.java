package com.nested.app.client.tarrakki.dto;

import lombok.Data;

@Data
public class OtpResponse {
  private String otp_type;
  private String investor_id;
  private String otp_id;
  private String email;
  private String mobile;
  private String expiry;
}
