package com.nested.app.client.bulkpe;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.reactor.circuitbreaker.operator.CircuitBreakerOperator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

/**
 * Client wrapper for Bulkpe APIs.
 * Provides a WebClient with authentication and resilience (circuit breaker).
 */
@Slf4j
@Service
public class BulkpeApi {

    private static final String SERVICE_NAME = "bulkpe";

    private final String baseUrl;
    private final String authToken;
    private final CircuitBreaker circuitBreaker;

    /**
     * Constructor injection ensures immutability and easier testing.
     * CircuitBreakerRegistry provides a centralized circuit breaker configuration.
     */
    public BulkpeApi(
            @Value("${bulkpe.api.base-url}") String baseUrl,
            @Value("${bulkpe.api.auth-token}") String authToken,
            CircuitBreakerRegistry registry) {

        this.baseUrl = baseUrl;
        this.authToken = authToken;
        this.circuitBreaker = registry.circuitBreaker(SERVICE_NAME);

        log.info("Initialized BulkpeApi client with baseUrl={}", baseUrl);
    }

    /**
     * Builds a WebClient instance pre-configured with:
     * - Base URL for Bulkpe API
     * - Authorization header
     * - Circuit breaker filter
     */
    public WebClient withAuth() {
        log.debug("Creating WebClient for Bulkpe API with baseUrl={}", baseUrl);

        return WebClient.builder()
                .baseUrl(baseUrl)
                .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + authToken)
                .filter(circuitBreakerFilter(circuitBreaker))
                .build();
    }

    /**
     * Wraps each WebClient request with Resilience4j circuit breaker.
     * If calls repeatedly fail, the breaker will open and short-circuit further requests.
     *
     * @param circuitBreaker The resilience4j circuit breaker instance
     * @return ExchangeFilterFunction to be applied on WebClient
     */
    private ExchangeFilterFunction circuitBreakerFilter(CircuitBreaker circuitBreaker) {
        return (request, next) -> {
            log.debug("Bulkpe API request: {} {}", request.method(), request.url());

            return next.exchange(request)
                    // Apply circuit breaker to the reactive chain
                    .transformDeferred(CircuitBreakerOperator.of(circuitBreaker))
                    .doOnSuccess(response -> {
                        log.info("Bulkpe API responded with status {}", response.statusCode());
                    })
                    .doOnError(ex -> {
                        log.error("Bulkpe API request failed: {}", ex.getMessage(), ex);
                    })
                    // Optional fallback (currently just rethrows a wrapped exception)
                    .onErrorResume(ex -> {
                        return Mono.error(new RuntimeException("Circuit breaker triggered for Bulkpe API", ex));
                    });
        };
    }
}
