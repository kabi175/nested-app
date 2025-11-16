package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class BankResponse {
  @JsonProperty("id")
  private String bankId;

  @JsonProperty("old_id")
  private Long paymentRef;
}
