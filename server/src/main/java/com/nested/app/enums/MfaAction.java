package com.nested.app.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum MfaAction {
  MF_BUY("MF_BUY"),
  MF_SELL("MF_SELL"),
  BANK_CHANGE("BANK_CHANGE"),
  WITHDRAWAL("WITHDRAWAL"),
  PROFILE_UPDATE("PROFILE_UPDATE"),
  EMAIL_UPDATE("EMAIL_UPDATE");

  @JsonValue @Getter private final String value;
}
