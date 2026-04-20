package com.nested.app.firebase;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
public class SecurityConfig {

  @Value("${admin.username}") private String adminUsername;
  @Value("${admin.password}") private String adminPassword;

  private final CorsConfigurationSource corsConfigurationSource;

  public SecurityConfig(CorsConfigurationSource corsConfigurationSource) {
    this.corsConfigurationSource = corsConfigurationSource;
  }

  @Order(1)
  @Bean
  public SecurityFilterChain adminSecurityFilterChain(HttpSecurity http) throws Exception {
    http
        .securityMatcher("/admin-monitor/**", "/actuator/**")
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/actuator/health", "/actuator/info").permitAll()
            .anyRequest().authenticated()
        )
        .formLogin(form -> form.loginPage("/admin-monitor/login").permitAll())
        .logout(logout -> logout
            .logoutUrl("/admin-monitor/logout")
            .logoutSuccessUrl("/admin-monitor/login")
        )
        .httpBasic(Customizer.withDefaults())
        .csrf(csrf -> csrf.ignoringRequestMatchers("/admin-monitor/**", "/actuator/**"))
        .userDetailsService(new InMemoryUserDetailsManager(
            User.withUsername(adminUsername)
                .password("{noop}" + adminPassword)
                .roles("ADMIN")
                .build()
        ));
    return http.build();
  }

  @Order(2)
  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.csrf(AbstractHttpConfigurer::disable)
        .cors(cors -> cors.configurationSource(corsConfigurationSource));

    http.authorizeHttpRequests(auth ->
            auth.requestMatchers(
                    "/public/**", "/api/v1/education", "/redirects/**", "/api/v1/app/version")
                .permitAll()
                .anyRequest()
                .authenticated()
        )
        .oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()));

    return http.build();
  }
}
