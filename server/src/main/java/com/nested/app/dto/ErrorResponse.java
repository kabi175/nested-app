package com.nested.app.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;

@AllArgsConstructor
public class ErrorResponse {
  @Getter private String message;
  @Getter private List<FieldError> errors;

  @AllArgsConstructor
  public static class FieldError {
    @Getter private String field;
    @Getter private String error;
  }
}
