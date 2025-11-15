package com.nested.app.services.mapper;

import com.nested.app.client.mf.dto.CreateKYCRequest;
import com.nested.app.entity.User;
import com.nested.app.utils.IpUtils;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Mapper for converting User entity to CreateKYCRequest. Handles all field mappings specific to KYC
 * requests.
 */
@Slf4j
@UtilityClass
public class CreateKYCRequestMapper {

  private static final WebClient webClient =
      WebClient.builder().baseUrl("https://ipinfo.io").build();

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
   * Extracts geolocation (latitude and longitude) from the current HTTP request. Uses ipinfo.io API
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
        if (clientIp == null || clientIp.equals("8.8.8.8")) {
          clientIp = "122.164.83.249";
        }
        log.debug("Extracting geolocation for IP: {}", clientIp);

        // Call ipinfo.io API to get geolocation data
        Map<String, Object> geoData = getGeolocationFromIpinfo(clientIp);

        if (!geoData.isEmpty()) {
          String loc = (String) geoData.get("loc");
          if (loc != null && !loc.isEmpty()) {
            // loc format is "latitude,longitude"
            String[] coordinates = loc.split(",");
            if (coordinates.length == 2) {
              geolocation.put("latitude", coordinates[0].trim());
              geolocation.put("longitude", coordinates[1].trim());
              log.debug(
                  "Geolocation extracted: latitude={}, longitude={}",
                  coordinates[0],
                  coordinates[1]);
            }
          }
        }
      }
    } catch (Exception e) {
      // If we can't get the request context, just return empty map
      // This might happen in async or non-web contexts
      log.warn("Failed to extract geolocation from request: {}", e.getMessage());
    }

    return geolocation;
  }

  /**
   * Calls ipinfo.io API to fetch geolocation data for a given IP address.
   *
   * @param ipAddress the IP address to look up
   * @return Map containing geolocation data from ipinfo.io API
   */
  private static Map<String, Object> getGeolocationFromIpinfo(String ipAddress) {
    try {
      log.debug("Calling ipinfo.io API for IP: {}", ipAddress);

      // Using WebClient to make the HTTP request
      String response =
          webClient
              .get()
              .uri("/{ip}/json", ipAddress)
              .retrieve()
              .bodyToMono(String.class)
              .timeout(Duration.ofSeconds(5))
              .block();

      if (response != null) {
        return parseJsonResponse(response);
      } else {
        log.warn("ipinfo.io API returned null response for IP: {}", ipAddress);
      }
    } catch (Exception e) {
      log.warn("Failed to call ipinfo.io API for IP {}: {}", ipAddress, e.getMessage());
    }

    return new HashMap<>();
  }

  /**
   * Parses JSON response from ipinfo.io API.
   *
   * @param jsonResponse the JSON response string
   * @return Map containing parsed geolocation data
   */
  private static Map<String, Object> parseJsonResponse(String jsonResponse) {
    Map<String, Object> result = new HashMap<>();
    try {
      // Simple JSON parsing - extract "loc" field
      // For more robust parsing, consider using a JSON library like Jackson or Gson
      int locIndex = jsonResponse.indexOf("\"loc\":");
      if (locIndex != -1) {
        int startQuote = jsonResponse.indexOf("\"", locIndex + 6);
        int endQuote = jsonResponse.indexOf("\"", startQuote + 1);
        if (startQuote != -1 && endQuote != -1) {
          String loc = jsonResponse.substring(startQuote + 1, endQuote);
          result.put("loc", loc);
          log.debug("Parsed loc from ipinfo.io response: {}", loc);
        }
      }
    } catch (Exception e) {
      log.warn("Failed to parse ipinfo.io JSON response: {}", e.getMessage());
    }

    return result;
  }
}
