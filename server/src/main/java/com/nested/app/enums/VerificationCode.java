package com.nested.app.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum VerificationCode {
  // related to readiness object
  KYC_UNAVAILABLE("kyc_unavailable"),

  KYC_INCOMPLETE("kyc_incomplete"),

  UNKNOWN("unknown"),
  // related to name object
  MISMATCH("mismatch"),

  // related to pan object
  INVALID("invalid"),
  AADHAAR_NOT_LINKED("aadhaar_not_linked"),

  // general error for all
  UPSTREAM_ERROR("upstream_error"),
  ;
  @Getter @JsonValue private final String value;
}
