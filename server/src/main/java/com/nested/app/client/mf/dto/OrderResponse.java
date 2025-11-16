package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class OrderResponse {
  private Long id;

  private String ref;

  @JsonProperty("source_ref_id")
  private String sourceRefId;
}
