package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class BankResponse {
  @JsonProperty("bank_id")
  private String bankId;
}
