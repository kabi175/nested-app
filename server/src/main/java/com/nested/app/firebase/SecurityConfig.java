package com.nested.app.firebase;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

import com.nested.app.filter.FirebaseAuthFilter;
import com.nested.app.utils.AppEnvironment;

@Configuration
public class SecurityConfig {

  private final FirebaseAuthFilter firebaseAuthFilter;
  private final AppEnvironment appEnvironment;
  private final CorsConfigurationSource corsConfigurationSource;

  public SecurityConfig(FirebaseAuthFilter firebaseAuthFilter, AppEnvironment appEnvironment, CorsConfigurationSource corsConfigurationSource) {
    this.firebaseAuthFilter = firebaseAuthFilter;
    this.appEnvironment = appEnvironment;
    this.corsConfigurationSource = corsConfigurationSource;
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .csrf(AbstractHttpConfigurer::disable) // disable CSRF for APIs
        .cors(cors -> cors.configurationSource(corsConfigurationSource)); // enable CORS

    // If in development mode (localhost), disable all security
    if (appEnvironment.isDevelopment()) {
      http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
    } else {
      // Production mode - require authentication
      http.authorizeHttpRequests(
              auth ->
                  auth.requestMatchers("/public/**")
                      .permitAll()
                      .anyRequest()
                      .authenticated() // everything else requires auth
          )
          // add Firebase filter before Spring's own UsernamePasswordAuthenticationFilter
          .addFilterBefore(firebaseAuthFilter, UsernamePasswordAuthenticationFilter.class);
    }

    return http.build();
  }
}
