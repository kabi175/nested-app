package com.nested.app.filter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Interceptor that applies entity-level authorization filters
 * Uses EntityAuthorizationFilter to automatically restrict data access
 */
@Component
@AllArgsConstructor
public class HibernateAuthorizationFilterInterceptor implements WebMvcConfigurer {
  
  private final EntityAuthorizationFilter entityAuthorizationFilter;

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry.addInterceptor(
        new HandlerInterceptor() {
          @Override
          public boolean preHandle(
              @NonNull HttpServletRequest request,
              @NonNull HttpServletResponse response,
              @NonNull Object handler) {
            // Apply entity-level authorization filters
            entityAuthorizationFilter.applyFilters();
            return true;
          }
        });
  }
}
