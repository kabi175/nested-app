package com.nested.app.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

public enum Occupation {
  BUSINESS("business"),
  SERVICE("service"),
  PROFESSIONAL("professional"),
  AGRICULTURE("agriculture"),
  RETIRED("retired"),
  HOUSEWIFE("housewife"),
  STUDENT("student"),
  OTHERS("others"),
  DOCTOR("doctor"),
  PRIVATE_SECTOR_SERVICE("private_sector_service"),
  PUBLIC_SECTOR_SERVICE("public_sector_service"),
  FOREX_DEALER("forex_dealer"),
  GOVERNMENT_SERVICE("government_service"),
  UNKNOWN_OR_NOT_APPLICABLE("unknown_or_not_applicable");

  @JsonValue @Getter private final String value;

  Occupation(String value) {
    this.value = value;
  }

  public static Occupation fromValue(String value) {
    for (Occupation occupation : values()) {
      if (occupation.value.equalsIgnoreCase(value)) {
        return occupation;
      }
    }
    throw new IllegalArgumentException("Unknown occupation: " + value);
  }
}
