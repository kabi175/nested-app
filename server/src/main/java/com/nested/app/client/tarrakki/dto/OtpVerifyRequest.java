package com.nested.app.client.tarrakki.dto;

import lombok.Data;

@Data
public class OtpVerifyRequest {
  private String otp_type;
  private String otp;
}
