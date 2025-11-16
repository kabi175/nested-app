package com.nested.app.client.mf.dto;

import lombok.Data;

@Data
public class CreateInvestorResponse {
  private String id;
  private String status;
  private String mobileRef;
  private String emailRef;
}
