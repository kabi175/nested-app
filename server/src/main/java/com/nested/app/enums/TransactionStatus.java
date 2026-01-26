package com.nested.app.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum TransactionStatus {
  VERIFICATION_PENDING("verification_pending"),
  PENDING("in_progress"),
  SUBMITTED("submitted"),
  COMPLETED("completed"),
  FAILED("failed"),
  REFUNDED("refunded");

  @Getter @JsonValue private final String value;
}
