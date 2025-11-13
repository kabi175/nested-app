package com.nested.app.services;

import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.exception.GeoIp2Exception;
import com.maxmind.geoip2.model.CityResponse;
import com.maxmind.geoip2.record.*;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.io.IOException;
import java.net.InetAddress;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

/**
 * Service for performing GeoIP lookups using MaxMind GeoLite2 database. The database is loaded once
 * at application startup and kept in memory for fast lookups.
 */
@Slf4j
@Service
public class GeoIPService {

  @Value("classpath:geo/GeoLite2-City.mmdb")
  private Resource geoIpDatabase;

  private DatabaseReader databaseReader;

  /**
   * Initializes the GeoIP database reader at application startup. This method is called only once,
   * making the database a singleton.
   */
  @PostConstruct
  public void init() {
    try {
      log.info("Initializing GeoIP database from: {}", geoIpDatabase.getFilename());
      databaseReader = new DatabaseReader.Builder(geoIpDatabase.getInputStream()).build();
      log.info("GeoIP database initialized successfully");
    } catch (IOException e) {
      log.error(
          "Failed to initialize GeoIP database. Please ensure GeoLite2-City.mmdb exists in src/main/resources/geo/",
          e);
      throw new RuntimeException("Failed to load GeoIP database", e);
    }
  }

  /** Closes the database reader when the application shuts down. */
  @PreDestroy
  public void destroy() {
    if (databaseReader != null) {
      try {
        databaseReader.close();
        log.info("GeoIP database reader closed successfully");
      } catch (IOException e) {
        log.warn("Error closing GeoIP database reader", e);
      }
    }
  }

  /**
   * Looks up geolocation information for the given IP address.
   *
   * @param ipAddress the IP address to look up
   * @return Map containing geolocation data (ip, city, state, country, latitude, longitude)
   */
  public Map<String, Object> getGeoLocation(String ipAddress) {
    Map<String, Object> locationData = new HashMap<>();
    locationData.put("ip", ipAddress);

    try {
      InetAddress inetAddress = InetAddress.getByName(ipAddress);
      CityResponse response = databaseReader.city(inetAddress);

      // Extract location information
      Location location = response.getLocation();
      City city = response.getCity();
      Subdivision subdivision = response.getMostSpecificSubdivision();
      Country country = response.getCountry();
      Postal postal = response.getPostal();

      // Populate the response map
      locationData.put("latitude", Optional.ofNullable(location.getLatitude()).orElse(0.0));
      locationData.put("longitude", Optional.ofNullable(location.getLongitude()).orElse(0.0));

      log.debug(
          "GeoIP lookup successful for IP: {} - City: {}, Country: {}",
          ipAddress,
          city.getName(),
          country.getName());

    } catch (GeoIp2Exception e) {
      log.warn("GeoIP lookup failed for IP: {} - {}", ipAddress, e.getMessage());
      setUnknownLocation(locationData);
    } catch (IOException e) {
      log.error("Error performing GeoIP lookup for IP: {}", ipAddress, e);
      setUnknownLocation(locationData);
    } catch (Exception e) {
      log.error("Unexpected error during GeoIP lookup for IP: {}", ipAddress, e);
      setUnknownLocation(locationData);
    }

    return locationData;
  }

  /**
   * Sets default "Unknown" values for all location fields.
   *
   * @param locationData the map to populate with unknown values
   */
  private void setUnknownLocation(Map<String, Object> locationData) {
    locationData.put("city", "Unknown");
    locationData.put("state", "Unknown");
    locationData.put("stateCode", "Unknown");
    locationData.put("country", "Unknown");
    locationData.put("countryCode", "Unknown");
    locationData.put("latitude", 0.0);
    locationData.put("longitude", 0.0);
    locationData.put("postalCode", "Unknown");
    locationData.put("timeZone", "Unknown");
  }

  /**
   * Checks if the GeoIP database is available and initialized.
   *
   * @return true if database is ready, false otherwise
   */
  public boolean isDatabaseAvailable() {
    return databaseReader != null;
  }
}
