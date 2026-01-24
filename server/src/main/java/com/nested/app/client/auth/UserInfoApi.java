package com.nested.app.client.auth;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Component
public class UserInfoApi {
  @Value("${spring.security.oauth2.client.provider.auth0.issuer-uri}")
  private String baseUrl;

  private WebClient withApi(String authToken) {
    return WebClient.builder()
        .baseUrl(baseUrl)
        .defaultHeader(HttpHeaders.AUTHORIZATION, authToken)
        .build();
  }

  public Mono<UserInfo> getUserInfo(String authToken) {
    return withApi(authToken).get().uri("userinfo").retrieve().bodyToMono(UserInfo.class);
  }
}
