package com.nested.app.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum BasketType {
  EDUCATION("education"),
  SUPER_FD("super_fd");

  @Getter @JsonValue private final String value;

  @JsonCreator
  public static BasketType fromValue(String value) {
    for (BasketType type : BasketType.values()) {
      if (type.value.equalsIgnoreCase(value)) {
        return type;
      }
    }
    throw new IllegalArgumentException("Unknown BasketType: " + value);
  }
}
