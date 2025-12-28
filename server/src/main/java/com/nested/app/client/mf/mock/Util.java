package com.nested.app.client.mf.mock;

import lombok.experimental.UtilityClass;

@UtilityClass
public class Util {
  public static String generateMockId(String prefix) {
    return prefix + "-" + System.currentTimeMillis();
  }
}
