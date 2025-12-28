package com.nested.app.exception;

/**
 * Exception thrown when an external service (API, KYC, etc.) call fails or returns unexpected
 * response
 */
public class ExternalServiceException extends RuntimeException {

  public ExternalServiceException(String message) {
    super(message);
  }

  public ExternalServiceException(String message, Throwable cause) {
    super(message, cause);
  }
}
