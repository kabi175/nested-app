package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PaymentsResponse {
  @JsonProperty("id")
  private String paymentId;

  private String status;

  @JsonProperty("failed_reason")
  private String failedReason;

  @JsonProperty("token_url")
  private String redirectUrl;
}
