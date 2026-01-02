package com.nested.app.client.finprimitives;

import com.nested.app.client.meta.BankApiClient;
import com.nested.app.client.meta.dto.IfscData;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@RequiredArgsConstructor
public class BankApiClientImpl implements BankApiClient {
  private static final String IFSC_API_URL = "/api/onb/ifsc_codes";
  private final FinPrimitivesAPI api;

  @Override
  public Mono<IfscData> fetchIfscData(String ifscCode) {
    return api.withAuth()
        .get()
        .uri(IFSC_API_URL + "/" + ifscCode)
        .retrieve()
        .bodyToMono(IfscData.class);
  }
}
