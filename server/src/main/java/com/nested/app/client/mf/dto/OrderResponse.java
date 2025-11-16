package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class OrderResponse {
  @JsonProperty("old_id")
  private Long paymentRef;

  @JsonProperty("id")
  private String ref;

  @JsonProperty("source_ref_id")
  private String sourceRefId;
}
