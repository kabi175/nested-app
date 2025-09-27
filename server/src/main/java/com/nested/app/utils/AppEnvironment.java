package com.nested.app.utils;

import lombok.AllArgsConstructor;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

@Component
@AllArgsConstructor
public class AppEnvironment {
  private final Environment environment;

  public boolean isDevelopment() {
    for (String profile : environment.getActiveProfiles()) {
      if ("dev".equals(profile)) {
        return true;
      }
    }
    return false;
  }
}
