package com.nested.app.client.tarrakki;

import com.nested.app.client.mf.dto.KycInitiateRequest;
import com.nested.app.client.mf.dto.KycInitiateResponse;
import com.nested.app.client.mf.dto.KycStausResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class KycClient {

  private final TarrakkiAPI tarrakkiAPI;

  public Mono<KycStausResponse> getKycStatus(String panNumber) {
    return tarrakkiAPI
        .withAuth()
        .get()
        .uri("/kyc?pan=" + panNumber)
        .retrieve()
        .bodyToMono(KycStausResponse.class);
  }

  public Mono<KycInitiateResponse> initiateKyc(KycInitiateRequest request) {
    return tarrakkiAPI
        .withAuth()
        .post()
        .uri("/kyc")
        .body(request, KycInitiateRequest.class)
        .retrieve()
        .bodyToMono(KycInitiateResponse.class);
  }
}
