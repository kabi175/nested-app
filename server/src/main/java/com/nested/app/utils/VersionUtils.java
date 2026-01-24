package com.nested.app.utils;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class VersionUtils {

  /**
   * Compares two semantic versions.
   *
   * @param v1 first version string (e.g., "1.2.3")
   * @param v2 second version string (e.g., "1.2.4")
   * @return 0 if v1 == v2, negative if v1 < v2, positive if v1 > v2
   */
  public static int compareVersions(String v1, String v2) {
    if (v1 == null || v2 == null) {
      return 0;
    }

    try {
      String[] parts1 = v1.split("\\.");
      String[] parts2 = v2.split("\\.");

      int length = Math.max(parts1.length, parts2.length);
      for (int i = 0; i < length; i++) {
        int num1 = i < parts1.length ? parseVersionPart(parts1[i]) : 0;
        int num2 = i < parts2.length ? parseVersionPart(parts2[i]) : 0;

        if (num1 < num2) {
          return -1;
        }
        if (num1 > num2) {
          return 1;
        }
      }
    } catch (Exception e) {
      log.error("Error comparing versions: {} and {}", v1, v2, e);
      return 0;
    }
    return 0;
  }

  private static int parseVersionPart(String part) {
    try {
      // Remove any non-numeric characters (like 'v' in 'v1.0.0')
      String numericPart = part.replaceAll("[^0-9]", "");
      return numericPart.isEmpty() ? 0 : Integer.parseInt(numericPart);
    } catch (NumberFormatException e) {
      return 0;
    }
  }
}
