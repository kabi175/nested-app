package com.nested.app.client.tarrakki;

import com.nested.app.client.tarrakki.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class MandateApiClient {

  private final TarrakkiAPI tarrakkiAPI;

  public Mono<MandateResponse> create(CreateMandateRequest request) {
    return tarrakkiAPI
        .withAuth()
        .post()
        .uri("/bank-mandates")
        .bodyValue(request)
        .retrieve()
        .bodyToMono(MandateResponse.class)
        .map(m -> get(m.getMandate_id()))
        .flatMap(m -> m);
  }

  public Mono<MandateResponse> get(String mandateId) {
    return tarrakkiAPI
        .withAuth()
        .get()
        .uri("/bank-mandates/" + mandateId)
        .retrieve()
        .bodyToMono(MandateResponse.class);
  }
}
