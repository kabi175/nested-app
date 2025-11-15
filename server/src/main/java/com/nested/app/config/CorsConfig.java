package com.nested.app.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
public class CorsConfig {

  @Bean
  public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // SECURITY FIX: Use exact origins instead of wildcard patterns
    // Only allow specific, trusted origins
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "https://verpan.in",
        "https://www.verpan.in",
        "https://nested-admin-client.vercel.app"
    ));
    
    // Allow all HTTP methods
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
    
    // SECURITY FIX: Restrict headers to only what's needed
    configuration.setAllowedHeaders(Arrays.asList(
        "Authorization",
        "Content-Type",
        "X-Requested-With",
        "Accept",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers"
    ));
    
    // Allow credentials (cookies, authorization headers, etc.)
    // Safe now that we're using exact origins
    configuration.setAllowCredentials(true);
    
    // Expose only necessary headers
    configuration.setExposedHeaders(Arrays.asList(
        "Content-Type",
        "Authorization"
    ));
    
    // How long the response from a pre-flight request can be cached by clients (in seconds)
    configuration.setMaxAge(3600L);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    
    return source;
  }
}

