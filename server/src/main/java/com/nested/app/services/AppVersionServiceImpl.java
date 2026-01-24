package com.nested.app.services;

import com.nested.app.dto.AppVersionResponse;
import com.nested.app.entity.AppVersion;
import com.nested.app.enums.Platform;
import com.nested.app.enums.UpdateType;
import com.nested.app.repository.AppVersionRepository;
import com.nested.app.utils.VersionUtils;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class AppVersionServiceImpl implements AppVersionService {

  private final AppVersionRepository appVersionRepository;

  @Override
  @Cacheable(
      value = "appVersion",
      key = "#version + #platform + #buildNumber + #deviceId",
      unless = "#result == null")
  public AppVersionResponse getVersionInfo(
      String currentVersion, Platform platform, Integer buildNumber, String deviceId) {
    // If platform is null, default to ANDROID or handle gracefully
    Platform effectivePlatform = platform != null ? platform : Platform.ANDROID;

    AppVersion versionInfo =
        appVersionRepository
            .findByPlatform(effectivePlatform)
            .orElseGet(
                () -> {
                  log.warn("Platform rules not found for {}. Using defaults.", effectivePlatform);
                  return AppVersion.builder()
                      .minSupportedVersion("1.0.0")
                      .latestVersion("1.0.0")
                      .minBuildNumber(0)
                      .rolloutPercentage(100)
                      .message("Please update the app to continue.")
                      .storeUrl("")
                      .releaseNotes("")
                      .build();
                });

    UpdateType updateType = determineUpdateType(currentVersion, buildNumber, deviceId, versionInfo);

    // Fetch all to get both URLs for the response
    List<AppVersion> allVersions = appVersionRepository.findAll();
    String androidUrl =
        allVersions.stream()
            .filter(v -> v.getPlatform() == Platform.ANDROID)
            .map(AppVersion::getStoreUrl)
            .findFirst()
            .orElse("");
    String iosUrl =
        allVersions.stream()
            .filter(v -> v.getPlatform() == Platform.IOS)
            .map(AppVersion::getStoreUrl)
            .findFirst()
            .orElse("");

    return AppVersionResponse.builder()
        .minSupportedVersion(versionInfo.getMinSupportedVersion())
        .latestVersion(versionInfo.getLatestVersion())
        .updateType(updateType)
        .message(versionInfo.getMessage())
        .androidUrl(androidUrl)
        .iosUrl(iosUrl)
        .releaseNotes(versionInfo.getReleaseNotes())
        .build();
  }

  private UpdateType determineUpdateType(
      String currentVersion, Integer buildNumber, String deviceId, AppVersion versionInfo) {
    if (currentVersion == null || currentVersion.trim().isEmpty()) {
      return UpdateType.FORCE;
    }

    try {
      // 1. Check for FORCE update based on version string
      if (VersionUtils.compareVersions(currentVersion, versionInfo.getMinSupportedVersion()) < 0) {
        return UpdateType.FORCE;
      }

      // 2. Check for FORCE update based on build number (if provided)
      if (buildNumber != null
          && versionInfo.getMinBuildNumber() != null
          && buildNumber < versionInfo.getMinBuildNumber()) {
        return UpdateType.FORCE;
      }

      // 3. Check for SOFT update based on latest version
      if (VersionUtils.compareVersions(currentVersion, versionInfo.getLatestVersion()) < 0) {
        // Apply staged rollout logic for soft updates
        if (isEligibleForRollout(deviceId, versionInfo.getRolloutPercentage())) {
          return UpdateType.SOFT;
        }
      }

      return UpdateType.NONE;
    } catch (Exception e) {
      log.error(
          "Error determining update type for version: {}, build: {}",
          currentVersion,
          buildNumber,
          e);
      return UpdateType.NONE;
    }
  }

  private boolean isEligibleForRollout(String deviceId, Integer rolloutPercentage) {
    if (rolloutPercentage == null || rolloutPercentage >= 100) {
      return true;
    }
    if (rolloutPercentage <= 0) {
      return false;
    }
    // If no deviceId is provided but rollout is < 100%, we don't rollout to be safe
    if (deviceId == null || deviceId.isEmpty()) {
      log.debug(
          "Rollout percentage is {}, but no deviceId provided. Skipping soft update.",
          rolloutPercentage);
      return false;
    }

    // Simple hash-based rollout
    int hash = Math.abs(deviceId.hashCode()) % 100;
    return hash < rolloutPercentage;
  }
}
