package com.nested.app.client.tarrakki.dto;

import lombok.Data;

@Data
public class InvestorResponse {
  private String id;
  private String investor_type;
  private String first_name;
  private String last_name;
  private String email;
  private String mobile;
  private String pan;
  private String status;
  private String created_at;
  private String updated_at;
}

