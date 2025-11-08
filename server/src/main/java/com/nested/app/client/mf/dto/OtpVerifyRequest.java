package com.nested.app.client.mf.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OtpVerifyRequest {
  private OtpRequest.Type otp_type;
  private String otp;
}
