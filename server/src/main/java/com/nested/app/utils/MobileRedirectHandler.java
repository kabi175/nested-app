package com.nested.app.utils;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MobileRedirectHandler {
  @Value("${app.mobile.scheme:nested}")
  private String mobileScheme;

  public String redirectUrl(String uri) {
    return String.format("redirect:%s://%s", mobileScheme, uri);
  }
}
