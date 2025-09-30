package com.nested.app.client.tarrakki.dto;

import lombok.Data;

@Data
public class OtpRequest {
  private String otp_type;
  private String investor_id;
}
