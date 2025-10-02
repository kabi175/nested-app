package com.nested.app.client.tarrakki;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

/** Service for interacting with Tarrakki API */
@Slf4j
@Service
@RequiredArgsConstructor
public class TarrakkiAPI {

  private final WebClient webClient;
  private final TarrakkiTokenProvider tokenProvider;

  @Value("${tarrakki.api.base-url}")
  private final String baseUrl;

  public WebClient withAuth() {
    String token = tokenProvider.getToken();
    var authToken = "Bearer " + token;
    return WebClient.builder()
        .baseUrl(baseUrl)
        .defaultHeader(HttpHeaders.AUTHORIZATION, authToken)
        .build();
  }
}
