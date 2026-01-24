package com.nested.app.utils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

public class VersionUtilsTest {

  @Test
  void testCompareVersions() {
    // Equal
    assertEquals(0, VersionUtils.compareVersions("1.0.0", "1.0.0"));
    assertEquals(0, VersionUtils.compareVersions("1.1", "1.1.0"));

    // Less than
    assertTrue(VersionUtils.compareVersions("1.0.0", "1.0.1") < 0);
    assertTrue(VersionUtils.compareVersions("1.0.0", "1.1.0") < 0);
    assertTrue(VersionUtils.compareVersions("0.9.9", "1.0.0") < 0);
    assertTrue(VersionUtils.compareVersions("1.0", "1.0.1") < 0);

    // Greater than
    assertTrue(VersionUtils.compareVersions("1.0.1", "1.0.0") > 0);
    assertTrue(VersionUtils.compareVersions("1.1.0", "1.0.0") > 0);
    assertTrue(VersionUtils.compareVersions("2.0.0", "1.9.9") > 0);
    assertTrue(VersionUtils.compareVersions("1.0.1", "1.0") > 0);

    // Malformed
    assertEquals(0, VersionUtils.compareVersions(null, "1.0.0"));
    assertEquals(0, VersionUtils.compareVersions("1.0.0", null));
    assertEquals(0, VersionUtils.compareVersions("abc", "1.0.0"));
  }
}
