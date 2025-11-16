package com.nested.app.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum ActivityPriority {
  HIGH("high"),
  MEDIUM("medium"),
  LOW("low");

  @Getter @JsonValue private final String value;
}
