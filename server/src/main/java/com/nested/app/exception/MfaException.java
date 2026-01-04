package com.nested.app.exception;

import lombok.Getter;

@Getter
public class MfaException extends RuntimeException {

  private final String errorCode;

  public MfaException(String message) {
    super(message);
    this.errorCode = "MFA_ERROR";
  }

  public MfaException(String message, Throwable cause) {
    super(message, cause);
    this.errorCode = "MFA_ERROR";
  }

  public MfaException(String message, String errorCode) {
    super(message);
    this.errorCode = errorCode;
  }
}
