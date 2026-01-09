package com.nested.app.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum MfaChannel {
  SMS("SMS"),
  WHATSAPP("WHATSAPP"),
  TOTP("TOTP"),
  EMAIL("EMAIL");

  @JsonValue @Getter private final String value;
}
