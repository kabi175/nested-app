package com.nested.app.client.tarrakki.dto;

import lombok.Data;

@Data
public class OtpVerifyRequest {
  private OtpRequest.Type otp_type;
  private String otp;
}
