package com.nested.app.client.tarrakki;

import com.nested.app.client.tarrakki.dto.FundResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class FundAPIClient {
  private static final String fundsApiUrl = "/funds";

  private final TarrakkiAPI tarrakkiAPI;

  // TODO: handle authentication, error handling, logging, etc.

  public Mono<FundResponse> fetchFundsList() {
    return tarrakkiAPI.withAuth().get().uri(fundsApiUrl).retrieve().bodyToMono(FundResponse.class);
  }
}
