package com.nested.app.services;

import com.nested.app.dto.AppVersionResponse;
import com.nested.app.enums.Platform;

public interface AppVersionService {
  AppVersionResponse getVersionInfo(
      String version, Platform platform, Integer buildNumber, String deviceId);
}
