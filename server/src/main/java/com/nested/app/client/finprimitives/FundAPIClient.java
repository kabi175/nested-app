package com.nested.app.client.finprimitives;

import com.nested.app.client.mf.dto.SchemeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class FundAPIClient {
  private static final String FUNDS_API_URL = "/v2/mf_scheme_plans/cybrillapoa";

  private final FinPrimitivesAPI api;

  public Mono<SchemeResponse> fetchFundsList(Pageable pageable) {
    return api.withAuth()
        .get()
        .uri(
            uriBuilder ->
                uriBuilder
                    .path(FUNDS_API_URL)
                    .queryParam("size", pageable.getPageSize())
                    .queryParam("page", pageable.getPageNumber())
                    .queryParam("expand", "mf_scheme,mf_fund")
                    .build())
        .retrieve()
        .bodyToMono(SchemeResponse.class);
  }
}
