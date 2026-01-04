package com.nested.app.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nested.app.annotation.RequiresMfa;
import com.nested.app.services.MfaService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.core.annotation.AnnotatedElementUtils;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * MFA Enforcement Interceptor that checks for @RequiresMfa annotation on controller methods and
 * validates MFA tokens. This runs after handler resolution, allowing access to the handler method
 * and its annotations.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class MfaEnforcementFilter implements WebMvcConfigurer, HandlerInterceptor {

  private final MfaService mfaService;
  private final ObjectMapper objectMapper;

  @Override
  public void addInterceptors(InterceptorRegistry registry) {
    registry
        .addInterceptor(this)
        .addPathPatterns("/**")
        .excludePathPatterns("/public/**", "/api/v1/education/**", "/redirects/**", "/auth/mfa/**");
  }

  @Override
  public boolean preHandle(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull Object handler)
      throws Exception {

    // Skip if not a HandlerMethod (e.g., static resources)
    if (!(handler instanceof HandlerMethod handlerMethod)) {
      return true;
    }

    // Check if handler method has @RequiresMfa annotation
    RequiresMfa requiresMfa =
        AnnotatedElementUtils.findMergedAnnotation(handlerMethod.getMethod(), RequiresMfa.class);
    if (requiresMfa == null) {
      // No MFA required for this endpoint
      return true;
    }

    // Check if user is authenticated
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || !authentication.isAuthenticated()) {
      // Let Spring Security handle unauthenticated requests
      return true;
    }

    // Extract MFA token from header
    String mfaToken = request.getHeader("X-MFA-Token");
    if (mfaToken == null || mfaToken.isEmpty()) {
      log.warn("MFA token missing for protected endpoint: {}", request.getRequestURI());
      sendMfaRequiredResponse(response);
      return false;
    }

    // Validate MFA token
    String requiredAction = requiresMfa.action();
    boolean isValid = mfaService.validateMfaToken(mfaToken, requiredAction);

    if (!isValid) {
      log.warn(
          "Invalid MFA token for endpoint: {}, action: {}",
          request.getRequestURI(),
          requiredAction);
      sendMfaRequiredResponse(response);
      return false;
    }

    // MFA token is valid, continue
    return true;
  }

  /**
   * Sends 403 response with MFA_REQUIRED error code
   *
   * @param response HTTP response
   * @throws IOException if writing response fails
   */
  private void sendMfaRequiredResponse(HttpServletResponse response) throws IOException {
    response.setStatus(HttpStatus.FORBIDDEN.value());
    response.setContentType("application/json");
    response.setCharacterEncoding("UTF-8");

    Map<String, Object> errorResponse = new HashMap<>();
    errorResponse.put("timestamp", LocalDateTime.now());
    errorResponse.put("status", HttpStatus.FORBIDDEN.value());
    errorResponse.put("error", "MFA_REQUIRED");
    errorResponse.put("message", "Multi-factor authentication required for this action");
    errorResponse.put("errorCode", "MFA_REQUIRED");

    objectMapper.writeValue(response.getWriter(), errorResponse);
  }
}
