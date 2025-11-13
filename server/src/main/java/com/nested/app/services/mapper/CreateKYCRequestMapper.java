package com.nested.app.services.mapper;

import com.nested.app.client.mf.dto.CreateKYCRequest;
import com.nested.app.entity.User;
import com.nested.app.services.GeoIPService;
import com.nested.app.utils.IpUtils;
import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Mapper for converting User entity to CreateKYCRequest. Handles all field mappings specific to KYC
 * requests.
 */
@Slf4j
@UtilityClass
public class CreateKYCRequestMapper {

  private static GeoIPService geoIPService;

  /**
   * Sets the GeoIPService instance (for Spring dependency injection). This should be called once
   * during application startup.
   *
   * @param service the GeoIPService instance
   */
  public static void setGeoIPService(GeoIPService service) {
    geoIPService = service;
  }

  /**
   * Maps User entity to CreateKYCRequest. This method populates all base KYC fields plus
   * Aadhaar-specific fields and geolocation.
   *
   * @param user the User entity to map from
   * @return CreateKYCRequest populated with user data
   */
  public static CreateKYCRequest mapUserToCreateKYCRequest(User user) {
    CreateKYCRequest request = new CreateKYCRequest();

    // Map common base fields using BaseKYCRequestMapper
    BaseKYCRequestMapper.mapUserToBaseKYCRequest(user, request);

    // Map CreateKYCRequest-specific fields
    request.setAadhaarNumber(user.getAadhaarLast4());
    request.setMaritalStatus(user.getMaritalStatus().getValue());

    // Map geolocation data from HTTP request
    Map<String, String> geolocation = extractGeolocationFromRequest();
    if (!geolocation.isEmpty()) {
      request.setGeolocation(geolocation);
    }

    return request;
  }

  /**
   * Extracts geolocation (latitude and longitude) from the current HTTP request. Uses GeoIPService
   * to look up accurate geolocation based on client IP address.
   *
   * @return Map containing latitude and longitude if available
   */
  private static Map<String, String> extractGeolocationFromRequest() {
    Map<String, String> geolocation = new HashMap<>();

    try {
      ServletRequestAttributes attributes =
          (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();

      if (attributes != null) {
        HttpServletRequest request = attributes.getRequest();

        // Extract client IP address
        String clientIp = IpUtils.getClientIpAddress(request);
        log.debug("Extracting geolocation for IP: {}", clientIp);

        // Use GeoIPService if available for accurate lookup
        if (geoIPService != null && geoIPService.isDatabaseAvailable()) {
          Map<String, Object> geoData = geoIPService.getGeoLocation(clientIp);

          Object lat = geoData.get("latitude");
          Object lon = geoData.get("longitude");

          if (lat != null && !lat.equals(0.0)) {
            geolocation.put("latitude", String.valueOf(lat));
          }
          if (lon != null && !lon.equals(0.0)) {
            geolocation.put("longitude", String.valueOf(lon));
          }

          log.debug("Geolocation extracted: latitude={}, longitude={}", lat, lon);
        } else {
          // Fallback: Try to get from request headers if GeoIPService is not available
          String latitude = request.getHeader("X-Latitude");
          String longitude = request.getHeader("X-Longitude");

          // If not in headers, try request parameters
          if (latitude == null) {
            latitude = request.getParameter("latitude");
          }
          if (longitude == null) {
            longitude = request.getParameter("longitude");
          }

          if (latitude != null && !latitude.isEmpty()) {
            geolocation.put("latitude", latitude);
          }
          if (longitude != null && !longitude.isEmpty()) {
            geolocation.put("longitude", longitude);
          }

          log.debug(
              "Geolocation from headers/params: latitude={}, longitude={}", latitude, longitude);
        }
      }
    } catch (Exception e) {
      // If we can't get the request context, just return empty map
      // This might happen in async or non-web contexts
      log.warn("Failed to extract geolocation from request: {}", e.getMessage());
    }

    return geolocation;
  }
}
