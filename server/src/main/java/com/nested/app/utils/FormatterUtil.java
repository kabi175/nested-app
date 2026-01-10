package com.nested.app.utils;

import jakarta.annotation.Nullable;
import java.util.HashMap;
import java.util.Map;
import lombok.experimental.UtilityClass;

@UtilityClass
public class FormatterUtil {
  @Nullable
  public static Map<String, Object> formatMobileNumber(String mobile) {
    if (mobile == null) {
      return null;
    }
    var isd = "91";
    if (mobile.startsWith("+")) {
      mobile = mobile.substring(1);
    }

    if (mobile.length() > 10) {
      isd = mobile.substring(0, mobile.length() - 10);
      mobile = mobile.substring(mobile.length() - 10);
    }

    return new HashMap<>(Map.of("isd", isd, "number", mobile));
  }

  public static Map<String, String> formatMobileNumberForConsent(String mobile) {
    if (mobile == null) {
      return new HashMap<>();
    }
    var isd = "91";
    if (mobile.startsWith("+")) {
      mobile = mobile.substring(1);
    }

    if (mobile.length() > 10) {
      isd = mobile.substring(0, mobile.length() - 10);
      mobile = mobile.substring(mobile.length() - 10);
    }

    return new HashMap<>(Map.of("isd_code", isd, "mobile", mobile));
  }
}
