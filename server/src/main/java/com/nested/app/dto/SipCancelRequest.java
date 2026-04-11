package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class SipCancelRequest {
  @JsonProperty("cancellation_code")
  private String cancellationCode;

  @JsonProperty("cancellation_reason")
  private String cancellationReason;
}
