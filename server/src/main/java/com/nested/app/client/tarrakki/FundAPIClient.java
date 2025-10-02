package com.nested.app.client.tarrakki;

import com.nested.app.client.tarrakki.dto.FundResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class FundAPIClient {
  private static final String fundsApiUrl = "/funds";

  private final TarrakkiAPI tarrakkiAPI;

  // TODO: handle authentication, error handling, logging, etc.

  public Mono<FundResponse> fetchFundsList(Pageable pageable) {
    return tarrakkiAPI
        .withAuth()
        .get()
        .uri(fundsApiUrl)
        .attribute("limit", pageable.getPageSize())
        .attribute("offset", pageable.getOffset())
        .retrieve()
        .bodyToMono(FundResponse.class);
  }
}
