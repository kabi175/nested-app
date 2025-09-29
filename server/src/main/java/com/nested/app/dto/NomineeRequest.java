package com.nested.app.dto;

import java.util.List;
import lombok.Data;

@Data
public class NomineeRequest {
  private String authenticator = "tarrakki";
  private String auth_ref;
  private List<Nominee> nominees;

  @Data
  public static class Nominee {
    private String name;
    private String relation;
    private int share;
    private boolean minor;
    private String email;
    private String mobile_number;
    private String identity_type;
    private String identity_value;
  }
}
