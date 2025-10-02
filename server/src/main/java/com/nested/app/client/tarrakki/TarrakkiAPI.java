package com.nested.app.client.tarrakki;

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

/** Service for interacting with Tarrakki API */
@Slf4j
@Service
public class TarrakkiAPI {

  private static final String SERVICE_NAME = "tarrakki";
  private final TarrakkiTokenProvider tokenProvider;
  @Value("${tarrakki.api.base-url}")
  private final String baseUrl;

  private final CircuitBreaker circuitBreaker;

  TarrakkiAPI(
      @Value("${tarrakki.api.base-url}") String baseUrl,
      TarrakkiTokenProvider tokenProvider,
      CircuitBreakerRegistry registry) {

    this.baseUrl = baseUrl;
    this.tokenProvider = tokenProvider;

    circuitBreaker = registry.circuitBreaker(SERVICE_NAME);
  }

  public WebClient withAuth() {
    String token = tokenProvider.getToken();
    var authToken = "Bearer " + token;
    return WebClient.builder()
        .baseUrl(baseUrl)
        .defaultHeader(HttpHeaders.AUTHORIZATION, authToken)
        .filter(circuitBreakerFilter(circuitBreaker))
        .build();
  }

  private ExchangeFilterFunction circuitBreakerFilter(CircuitBreaker circuitBreaker) {
    return (request, next) ->
        next.exchange(request)
            .transformDeferred(CircuitBreakerOperator.of(circuitBreaker)) // <-- apply CB here
            .onErrorResume(
                ex -> {
                  // optional fallback
                  return Mono.error(new RuntimeException("Circuit breaker triggered", ex));
                });
  }
}
