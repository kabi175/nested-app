package com.nested.app.utils;

import jakarta.servlet.http.HttpServletRequest;
import lombok.experimental.UtilityClass;
import lombok.extern.slf4j.Slf4j;

/**
 * Utility class for extracting client IP addresses from HTTP requests. Handles proxy headers and
 * provides fallback mechanisms.
 */
@Slf4j
@UtilityClass
public class IpUtils {

  private static final String[] IP_HEADER_CANDIDATES = {
    "X-Forwarded-For",
    "Proxy-Client-IP",
    "WL-Proxy-Client-IP",
    "HTTP_X_FORWARDED_FOR",
    "HTTP_X_FORWARDED",
    "HTTP_X_CLUSTER_CLIENT_IP",
    "HTTP_CLIENT_IP",
    "HTTP_FORWARDED_FOR",
    "HTTP_FORWARDED",
    "HTTP_VIA",
    "REMOTE_ADDR",
    "X-Real-IP"
  };

  private static final String LOCALHOST_IPV4 = "127.0.0.1";
  private static final String LOCALHOST_IPV6 = "0:0:0:0:0:0:0:1";
  private static final String LOCALHOST_IPV6_SHORT = "::1";
  private static final String FALLBACK_IP = "8.8.8.8";

  /**
   * Extracts the client IP address from the HTTP request. Checks various headers commonly used by
   * proxies and load balancers. Falls back to request.getRemoteAddr() if no headers are found. Uses
   * a fallback IP (8.8.8.8) for localhost addresses to enable testing.
   *
   * @param request the HTTP servlet request
   * @return the client IP address
   */
  public static String getClientIpAddress(HttpServletRequest request) {
    if (request == null) {
      log.warn("HttpServletRequest is null, returning fallback IP");
      return FALLBACK_IP;
    }

    // Check all possible IP header candidates
    for (String header : IP_HEADER_CANDIDATES) {
      String ip = request.getHeader(header);
      if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
        // X-Forwarded-For can contain multiple IPs (client, proxy1, proxy2, ...)
        // The first one is the original client IP
        if (ip.contains(",")) {
          ip = ip.split(",")[0].trim();
        }

        String ipv4 = extractIpv4(ip);
        if (ipv4 != null) {
          log.debug("Found client IPv4 '{}' from header '{}'", ipv4, header);
          return handleLocalhostIp(ipv4);
        }
      }
    }

    // Fallback to remote address
    String remoteAddr = request.getRemoteAddr();
    log.debug("Using remote address: {}", remoteAddr);
    String ipv4 = extractIpv4(remoteAddr);
    return handleLocalhostIp(ipv4 != null ? ipv4 : FALLBACK_IP);
  }

  /** Extracts IPv4 address from a given IP string. Returns null if not IPv4. */
  private static String extractIpv4(String ip) {
    if (ip == null) return null;
    if (ip.matches("^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$")) {
      return ip;
    }
    // Try to resolve IPv6 to IPv4 if possible
    try {
      java.net.InetAddress inet = java.net.InetAddress.getByName(ip);
      if (inet instanceof java.net.Inet4Address) {
        return inet.getHostAddress();
      }
    } catch (Exception ignored) {
      log.warn("Could not parse ipv4 from string '{}'", ip);
    }
    return null;
  }

  /**
   * Handles localhost IP addresses by returning a fallback IP for testing. This allows GeoIP lookup
   * to work in development environments.
   *
   * @param ip the IP address to check
   * @return the original IP or fallback IP if localhost
   */
  private static String handleLocalhostIp(String ip) {
    if (isLocalhostIp(ip)) {
      log.debug("Localhost IP detected ({}), using fallback IP: {}", ip, FALLBACK_IP);
      return FALLBACK_IP;
    }
    return ip;
  }

  /**
   * Checks if the given IP address is a localhost address.
   *
   * @param ip the IP address to check
   * @return true if localhost, false otherwise
   */
  private static boolean isLocalhostIp(String ip) {
    if (ip == null || ip.isEmpty()) {
      return false;
    }
    return LOCALHOST_IPV4.equals(ip)
        || LOCALHOST_IPV6.equals(ip)
        || LOCALHOST_IPV6_SHORT.equals(ip);
  }

  /**
   * Validates if a string is a valid IP address (basic validation).
   *
   * @param ip the string to validate
   * @return true if valid IP address format, false otherwise
   */
  private static boolean isValidIpAddress(String ip) {
    if (ip == null || ip.isEmpty()) {
      return false;
    }

    // Basic validation - check if it looks like an IP address
    // IPv4: xxx.xxx.xxx.xxx
    // IPv6: contains colons
    return ip.matches("^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$") || ip.contains(":");
  }
}
