package com.nested.app.client.finprimitives;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import io.github.resilience4j.reactor.circuitbreaker.operator.CircuitBreakerOperator;
import io.github.resilience4j.reactor.ratelimiter.operator.RateLimiterOperator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Slf4j
@Service
public class FinPrimitivesAPI {

  private static final String SERVICE_NAME = "finprimitives";
  private final FinPrimitivesTokenProvider tokenProvider;
  private final String baseUrl;
  private final CircuitBreaker circuitBreaker;
  private final RateLimiterRegistry rateLimiterRegistry;
  private final String tenant;

  public FinPrimitivesAPI(
      @Value("${finprimitives.api.base-url}") String baseUrl,
      @Value("${finprimitives.api.tenant}") String tenant,
      FinPrimitivesTokenProvider tokenProvider,
      CircuitBreakerRegistry registry,
      RateLimiterRegistry rateLimiterRegistry) {
    this.baseUrl = baseUrl;
    this.tokenProvider = tokenProvider;
    this.circuitBreaker = registry.circuitBreaker(SERVICE_NAME);
    this.rateLimiterRegistry = rateLimiterRegistry;
    this.tenant = tenant;
  }

  public WebClient withAuth() {
    String token = tokenProvider.getToken();
    String authToken = "Bearer " + token;
    RateLimiter rateLimiter = rateLimiterRegistry.rateLimiter(SERVICE_NAME);
    return WebClient.builder()
        .baseUrl(baseUrl)
        .defaultHeader(HttpHeaders.AUTHORIZATION, authToken)
        .defaultHeader("x-tenant-id", tenant)
        .filter(logRequestBodyFilter())
        .filter(
            (request, next) ->
                next.exchange(request).transformDeferred(RateLimiterOperator.of(rateLimiter)))
        .filter(circuitBreakerFilter(circuitBreaker))
        .filter(
            ExchangeFilterFunction.ofResponseProcessor(
                clientResponse -> {
                  if (clientResponse.statusCode().is4xxClientError()) {
                    log.error(
                        "FinPrimitives API returned 5xx error: {}", clientResponse.statusCode());

                    clientResponse
                        .bodyToMono(String.class)
                        .flatMap(
                            body -> {
                              log.error("Response body: {}", body);
                              return Mono.empty();
                            })
                        .subscribe();
                  }
                  return Mono.just(clientResponse);
                }))
        .build();
  }

  private ExchangeFilterFunction logRequestBodyFilter() {
    return (request, next) -> {
      return next.exchange(request)
          .doOnSuccess(
              response -> {
                log.debug("FinPrimitives API Response Status: {}", response.statusCode());
              })
          .doOnError(
              error -> {
                log.error("FinPrimitives API Request Error: {}", error.getMessage());
              });
    };
  }

  private ExchangeFilterFunction circuitBreakerFilter(CircuitBreaker circuitBreaker) {
    return (request, next) ->
        next.exchange(request)
            .transformDeferred(CircuitBreakerOperator.of(circuitBreaker))
            .onErrorResume(ex -> Mono.error(new RuntimeException("Circuit breaker triggered", ex)));
  }
}
