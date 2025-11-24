package com.nested.app.client.finprimitives;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nested.app.client.mf.MandateApiClient;
import com.nested.app.client.mf.dto.ActionRequired;
import com.nested.app.client.mf.dto.MandateDto;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@RequiredArgsConstructor
public class MandateApiClientImpl implements MandateApiClient {
  private static final String MANDATE_API_URL = "/api/pg/mandates";
  private static final String MANDATE_AUTH_API_URL = "/api/pg/payments/emandate/auth";
  private final FinPrimitivesAPI api;
  private final ObjectMapper objectMapper;

  @Value("${app.url}")
  private final String APP_URL;

  @Override
  public Mono<MandateDto> createMandate(MandateDto dto) {
    try {
      log.info("Creating mandate with details: {}", objectMapper.writeValueAsString(dto));
    } catch (Exception e) {
      log.warn("Failed to serialize mandate request for logging", e);
    }

    return api.withAuth()
        .post()
        .uri(MANDATE_API_URL)
        .bodyValue(dto)
        .retrieve()
        .bodyToMono(MandateDto.class);
  }

  @Override
  public Mono<MandateDto> fetchMandate(Long id) {
    log.info("Fetching mandate with id: {}", id);
    return api.withAuth()
        .get()
        .uri(uriBuilder -> uriBuilder.path(MANDATE_API_URL + "/" + id).build())
        .retrieve()
        .bodyToMono(MandateDto.class);
  }

  @Override
  public Mono<ActionRequired> authorizeMandate(Long id) {
    log.info("Authorizing mandate with id: {}", id);
    return api.withAuth()
        .post()
        .uri(MANDATE_AUTH_API_URL)
        .bodyValue(Map.of("mandate_id", id, "payment_postback_url", callbackUrl(id)))
        .retrieve()
        .bodyToMono(Map.class)
        .map(o -> ActionRequired.builder().redirectUrl(o.get("token_url").toString()).build());
  }

  private String callbackUrl(Long mandateID) {
    return APP_URL + "/redirects/mandate/" + mandateID;
  }
}
