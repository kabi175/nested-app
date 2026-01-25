package com.nested.app.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Filter to add trace ID to all incoming HTTP requests.
 * This filter runs FIRST (highest precedence) so all subsequent filters/logs have trace IDs.
 */
@Slf4j
@Component
public class TraceIdFilter extends OncePerRequestFilter {

    public static final String TRACE_ID_HEADER = "X-Trace-Id";
    public static final String TRACE_ID_KEY = "traceId";
    public static final String SPAN_ID_KEY = "spanId";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        
        // Check if trace ID is provided in request header, otherwise generate one
        // Generate 32-character hexadecimal trace ID (standard format for distributed tracing)
        String traceId = request.getHeader(TRACE_ID_HEADER);
        if (traceId == null || traceId.isBlank()) {
            traceId = UUID.randomUUID().toString().replace("-", "").toLowerCase();
        }
        
        // Generate 16-character hexadecimal span ID
        String spanId = UUID.randomUUID().toString().replace("-", "").substring(0, 16).toLowerCase();
        
        // Add to MDC for logging
        MDC.put(TRACE_ID_KEY, traceId);
        MDC.put(SPAN_ID_KEY, spanId);
        
        // Add trace ID to response header for client correlation
        response.setHeader(TRACE_ID_HEADER, traceId);
        
        long startTime = System.currentTimeMillis();
        
        try {
            // Log request start (skip actuator and health endpoints)
            if (!isSkippedPath(request.getRequestURI())) {
                log.info(">>> {} {} | Client: {}", 
                    request.getMethod(), 
                    request.getRequestURI(),
                    getClientIp(request));
            }
            
            filterChain.doFilter(request, response);
            
        } finally {
            long duration = System.currentTimeMillis() - startTime;
            
            // Log request completion (skip actuator endpoints)
            if (!isSkippedPath(request.getRequestURI())) {
                log.info("<<< {} {} | Status: {} | Duration: {}ms", 
                    request.getMethod(), 
                    request.getRequestURI(),
                    response.getStatus(),
                    duration);
            }
            
            // Clear MDC after request completes
            MDC.clear();
        }
    }
    
    private boolean isSkippedPath(String uri) {
        return uri.contains("/actuator") || 
               uri.contains("/health") || 
               uri.contains("/favicon.ico");
    }
    
    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
