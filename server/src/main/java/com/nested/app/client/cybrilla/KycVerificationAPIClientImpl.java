package com.nested.app.client.cybrilla;

import com.nested.app.client.mf.KycVerificationAPIClient;
import com.nested.app.client.mf.dto.EntityResponse;
import com.nested.app.client.mf.dto.KycVerificationRequest;
import com.nested.app.client.mf.dto.KycVerificationResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@RequiredArgsConstructor
public class KycVerificationAPIClientImpl implements KycVerificationAPIClient {
  private static final String PRE_VERIFY_API_URL = "/poa/pre_verifications";
  private final CybrillaAPI api;

  @Override
  public Mono<EntityResponse> create(KycVerificationRequest request) {
    return api.withAuth()
        .post()
        .uri(PRE_VERIFY_API_URL)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(EntityResponse.class);
  }

  @Override
  public Mono<KycVerificationResponse> fetch(String ref) {
    return api.withAuth()
        .get()
        .uri(PRE_VERIFY_API_URL + "/" + ref)
        .retrieve()
        .bodyToMono(KycVerificationResponse.class);
  }
}
