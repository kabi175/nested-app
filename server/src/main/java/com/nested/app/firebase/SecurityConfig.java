package com.nested.app.firebase;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

public class SecurityConfig {

  @Value("${auth0.domain}")
  private String auth0Domain;

  private final CorsConfigurationSource corsConfigurationSource;

  public SecurityConfig(CorsConfigurationSource corsConfigurationSource) {
    this.corsConfigurationSource = corsConfigurationSource;
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.csrf(AbstractHttpConfigurer::disable) // disable CSRF for APIs
        .cors(cors -> cors.configurationSource(corsConfigurationSource)); // enable CORS

    // Production mode - require authentication
    http.authorizeHttpRequests(
            auth ->
                auth.requestMatchers("/public/**", "/api/v1/education", "/redirects/**")
                    .permitAll()
                    .anyRequest()
                    .authenticated() // everything else requires auth
            )
        .oauth2ResourceServer(a -> a.jwt(Customizer.withDefaults()));

    return http.build();
  }

  @Bean
  public JwtDecoder jwtDecoder() {
    String issuerUri = "https://" + auth0Domain + "/";
    return NimbusJwtDecoder.withIssuerLocation(issuerUri).build();
  }
}
