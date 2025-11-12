package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonValue;

public enum Gender {
  MALE,
  FEMALE,
  TRANSGENDER;

  @JsonValue
  public String getValue() {
    return this.name().toLowerCase();
  }
}
