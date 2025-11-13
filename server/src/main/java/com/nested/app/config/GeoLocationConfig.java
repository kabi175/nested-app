package com.nested.app.config;

import com.nested.app.services.GeoIPService;
import com.nested.app.services.mapper.CreateKYCRequestMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for setting up geolocation services. Injects GeoIPService into the static
 * mapper for geolocation lookups.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class GeoLocationConfig {

  private final GeoIPService geoIPService;

  /**
   * Initializes the CreateKYCRequestMapper with GeoIPService. This allows the static mapper to
   * access the Spring-managed service.
   */
  @PostConstruct
  public void init() {
    CreateKYCRequestMapper.setGeoIPService(geoIPService);
    log.info("GeoIPService injected into CreateKYCRequestMapper");
  }
}
