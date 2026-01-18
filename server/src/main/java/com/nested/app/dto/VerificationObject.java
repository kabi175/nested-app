package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.enums.VerificationCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

public class VerificationObject {
  public VerificationStatus status;
  public VerificationCode code;
  public String reason;

  @RequiredArgsConstructor
  public enum VerificationStatus {
    VERIFIED("verified"),
    FAILED("failed");

    @Getter @JsonProperty private final String value;
  }
}
