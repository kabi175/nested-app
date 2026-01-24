package com.nested.app.controllers;

import com.nested.app.dto.AppVersionResponse;
import com.nested.app.enums.Platform;
import com.nested.app.services.AppVersionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/app")
@Tag(name = "App", description = "App related endpoints")
public class AppVersionController {

  private final AppVersionService appVersionService;

  @GetMapping("/version")
  @Operation(
      summary = "Get app version info",
      description = "Returns version rules and update type based on client version")
  public ResponseEntity<AppVersionResponse> getVersion(
      @RequestHeader(value = "X-App-Version", required = false) String version,
      @RequestHeader(value = "X-Platform", required = false) String platformStr,
      @RequestHeader(value = "X-Build-Number", required = false) Integer buildNumber,
      @RequestHeader(value = "X-Device-Id", required = false) String deviceId) {

    log.info(
        "App version check request: version={}, platform={}, build={}, deviceId={}",
        version,
        platformStr,
        buildNumber,
        deviceId);

    Platform platform = null;
    if (platformStr != null) {
      try {
        platform = Platform.valueOf(platformStr.toUpperCase());
      } catch (IllegalArgumentException e) {
        log.warn("Invalid platform header: {}", platformStr);
      }
    }

    AppVersionResponse response =
        appVersionService.getVersionInfo(version, platform, buildNumber, deviceId);
    return ResponseEntity.ok(response);
  }
}
