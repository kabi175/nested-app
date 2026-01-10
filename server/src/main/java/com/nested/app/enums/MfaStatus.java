package com.nested.app.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum MfaStatus {
  PENDING("PENDING"),
  VERIFIED("VERIFIED"),
  EXPIRED("EXPIRED"),
  FAILED("FAILED");

  @JsonValue @Getter private final String value;
}
