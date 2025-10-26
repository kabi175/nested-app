package com.nested.app.client.mf.mock;

public class Util {
  public static String generateMockId(String prefix) {
    return prefix + "-" + System.currentTimeMillis();
  }
}
