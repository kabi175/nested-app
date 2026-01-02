package com.nested.app.client.meta.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class IfscData {
  @JsonProperty("ifsc_code")
  private String ifscCode;

  @JsonProperty("branch_name")
  private String branchName;

  @JsonProperty("bank_name")
  private String bankName;
}
