package com.nested.app.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum BasketType {
  EDUCATION("education"),
  SUPER_FD("super_fd");

  @Getter @JsonValue private final String value;
}
