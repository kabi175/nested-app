package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Data
public class PaymentsResponse {
  @JsonProperty("id")
  private String paymentId;

  private Status status;

  @JsonProperty("failed_reason")
  private String failedReason;

  @JsonProperty("token_url")
  private String redirectUrl;

  @RequiredArgsConstructor
  public enum Status {
    PENDING("PENDING"),
    SUBMITTED("SUBMITTED"),
    SUCCESS("SUCCESS"),
    FAILED("FAILED"),
    INITIATED("INITIATED"),
    APPROVED("APPROVED");

    @JsonValue @Getter private final String value;
  }
}
