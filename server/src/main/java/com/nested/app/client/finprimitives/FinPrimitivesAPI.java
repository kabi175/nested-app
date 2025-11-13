package com.nested.app.client.finprimitives;

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

/** Service for interacting with FinPrimitives API */
@Slf4j
@Service
public class FinPrimitivesAPI {

  private static final String SERVICE_NAME = "finprimitives";
  private final FinPrimitivesTokenProvider tokenProvider;
  private final String baseUrl;
  private final CircuitBreaker circuitBreaker;

  public FinPrimitivesAPI(
      @Value("${finprimitives.api.base-url}") String baseUrl,
      FinPrimitivesTokenProvider tokenProvider,
      CircuitBreakerRegistry registry) {
    this.baseUrl = baseUrl;
    this.tokenProvider = tokenProvider;
    this.circuitBreaker = registry.circuitBreaker(SERVICE_NAME);
  }

  public WebClient withAuth() {
    String token = tokenProvider.getToken();
    String authToken = "Bearer " + token;
    return WebClient.builder()
        .baseUrl(baseUrl)
        .defaultHeader(HttpHeaders.AUTHORIZATION, authToken)
        .filter(circuitBreakerFilter(circuitBreaker))
        .filter(
            ExchangeFilterFunction.ofResponseProcessor(
                clientResponse -> {
                  if (clientResponse.statusCode().is5xxServerError()) {
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

  private ExchangeFilterFunction circuitBreakerFilter(CircuitBreaker circuitBreaker) {
    return (request, next) ->
        next.exchange(request)
            .transformDeferred(CircuitBreakerOperator.of(circuitBreaker))
            .onErrorResume(ex -> Mono.error(new RuntimeException("Circuit breaker triggered", ex)));
  }
}
