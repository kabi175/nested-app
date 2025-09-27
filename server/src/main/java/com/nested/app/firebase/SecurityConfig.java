package com.nested.app.firebase;

import com.nested.app.filter.FirebaseAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

  private final FirebaseAuthFilter firebaseAuthFilter;

  public SecurityConfig(FirebaseAuthFilter firebaseAuthFilter) {
    this.firebaseAuthFilter = firebaseAuthFilter;
  }

  @Bean
  public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http.csrf(AbstractHttpConfigurer::disable) // disable CSRF for APIs
        .authorizeHttpRequests(
            auth ->
                auth.requestMatchers("/public")
                    .permitAll()
                    .anyRequest()
                    .authenticated() // everything else requires auth
            )
        // add Firebase filter before Spring’s own UsernamePasswordAuthenticationFilter
        .addFilterBefore(firebaseAuthFilter, UsernamePasswordAuthenticationFilter.class);

    return http.build();
  }
}
