package com.nested.app.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

import com.nested.app.dto.AppVersionResponse;
import com.nested.app.entity.AppVersion;
import com.nested.app.enums.Platform;
import com.nested.app.enums.UpdateType;
import com.nested.app.repository.AppVersionRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class AppVersionServiceTest {

  @Mock private AppVersionRepository appVersionRepository;

  @InjectMocks private AppVersionServiceImpl appVersionService;

  private AppVersion androidVersion;
  private AppVersion iosVersion;

  @BeforeEach
  void setUp() {
    androidVersion =
        AppVersion.builder()
            .platform(Platform.ANDROID)
            .minSupportedVersion("1.4.0")
            .latestVersion("1.7.2")
            .minBuildNumber(100)
            .rolloutPercentage(100)
            .message("Please update")
            .storeUrl("https://android.url")
            .build();

    iosVersion =
        AppVersion.builder()
            .platform(Platform.IOS)
            .minSupportedVersion("1.4.0")
            .latestVersion("1.7.2")
            .minBuildNumber(100)
            .rolloutPercentage(100)
            .message("Please update")
            .storeUrl("https://ios.url")
            .build();
  }

  @Test
  void testForceUpdate() {
    when(appVersionRepository.findByPlatform(Platform.ANDROID))
        .thenReturn(Optional.of(androidVersion));
    when(appVersionRepository.findAll()).thenReturn(List.of(androidVersion, iosVersion));

    AppVersionResponse response =
        appVersionService.getVersionInfo("1.3.9", Platform.ANDROID, 120, "device1");

    assertEquals(UpdateType.FORCE, response.getUpdateType());
    assertEquals("1.4.0", response.getMinSupportedVersion());
    assertEquals("1.7.2", response.getLatestVersion());
    assertEquals("https://android.url", response.getAndroidUrl());
    assertEquals("https://ios.url", response.getIosUrl());
  }

  @Test
  void testForceUpdateByBuildNumber() {
    when(appVersionRepository.findByPlatform(Platform.ANDROID))
        .thenReturn(Optional.of(androidVersion));
    when(appVersionRepository.findAll()).thenReturn(List.of(androidVersion, iosVersion));

    // Version is fine, but build number is too low
    AppVersionResponse response =
        appVersionService.getVersionInfo("1.5.0", Platform.ANDROID, 50, "device1");

    assertEquals(UpdateType.FORCE, response.getUpdateType());
  }

  @Test
  void testSoftUpdate() {
    when(appVersionRepository.findByPlatform(Platform.ANDROID))
        .thenReturn(Optional.of(androidVersion));
    when(appVersionRepository.findAll()).thenReturn(List.of(androidVersion, iosVersion));

    AppVersionResponse response =
        appVersionService.getVersionInfo("1.5.0", Platform.ANDROID, 120, "device1");

    assertEquals(UpdateType.SOFT, response.getUpdateType());
  }

  @Test
  void testSoftUpdateRollout() {
    androidVersion.setRolloutPercentage(50); // 50% rollout
    when(appVersionRepository.findByPlatform(Platform.ANDROID))
        .thenReturn(Optional.of(androidVersion));
    when(appVersionRepository.findAll()).thenReturn(List.of(androidVersion, iosVersion));

    // "1" hashCode: 49 -> 49 % 100 = 49 -> should be included in 50% (0-49)
    AppVersionResponse response1 =
        appVersionService.getVersionInfo("1.5.0", Platform.ANDROID, 120, "1");
    assertEquals(UpdateType.SOFT, response1.getUpdateType());

    // "a" hashCode: 97 -> 97 % 100 = 97 -> should NOT be included in 50%
    AppVersionResponse response2 =
        appVersionService.getVersionInfo("1.5.0", Platform.ANDROID, 120, "a");
    assertEquals(UpdateType.NONE, response2.getUpdateType());
  }

  @Test
  void testNoUpdate() {
    when(appVersionRepository.findByPlatform(Platform.ANDROID))
        .thenReturn(Optional.of(androidVersion));
    when(appVersionRepository.findAll()).thenReturn(List.of(androidVersion, iosVersion));

    AppVersionResponse response =
        appVersionService.getVersionInfo("1.7.2", Platform.ANDROID, 120, "device1");

    assertEquals(UpdateType.NONE, response.getUpdateType());
  }

  @Test
  void testNoUpdateHigher() {
    when(appVersionRepository.findByPlatform(Platform.ANDROID))
        .thenReturn(Optional.of(androidVersion));
    when(appVersionRepository.findAll()).thenReturn(List.of(androidVersion, iosVersion));

    AppVersionResponse response =
        appVersionService.getVersionInfo("1.8.0", Platform.ANDROID, 120, "device1");

    assertEquals(UpdateType.NONE, response.getUpdateType());
  }

  @Test
  void testNullVersion() {
    when(appVersionRepository.findByPlatform(Platform.ANDROID))
        .thenReturn(Optional.of(androidVersion));
    when(appVersionRepository.findAll()).thenReturn(List.of(androidVersion, iosVersion));

    AppVersionResponse response =
        appVersionService.getVersionInfo(null, Platform.ANDROID, 120, "device1");

    assertEquals(UpdateType.FORCE, response.getUpdateType());
  }
}
