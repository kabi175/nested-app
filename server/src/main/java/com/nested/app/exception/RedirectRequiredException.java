package com.nested.app.exception;

import lombok.Getter;

@Getter
public class RedirectRequiredException extends RuntimeException {
  private final String redirectUrl;

  public RedirectRequiredException(String redirectUrl) {
    this.redirectUrl = redirectUrl;
  }
}
