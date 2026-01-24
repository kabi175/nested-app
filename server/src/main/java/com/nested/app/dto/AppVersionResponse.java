package com.nested.app.dto;

import com.nested.app.enums.UpdateType;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AppVersionResponse {
  private String minSupportedVersion;
  private String latestVersion;
  private UpdateType updateType;
  private String message;
  private String androidUrl;
  private String iosUrl;
  private String releaseNotes;
}
