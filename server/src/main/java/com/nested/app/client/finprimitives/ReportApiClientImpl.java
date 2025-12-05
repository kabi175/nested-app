package com.nested.app.client.finprimitives;

import com.nested.app.client.mf.ReportApiClient;
import com.nested.app.client.mf.dto.SchemeWiseReportResponse;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportApiClientImpl implements ReportApiClient {
  private static final String REPORT_API_URL = "/v2/transactions/reports/scheme_wise_returns";
  private final FinPrimitivesAPI api;

  @Override
  public Mono<EntityListResponse<SchemeWiseReportResponse>> fetchSchemeWiseReport(
      String accountRef) {
    return api.withAuth()
        .post()
        .uri(REPORT_API_URL)
        .bodyValue(Map.of("mf_investment_account", accountRef))
        .retrieve()
        .bodyToMono(
            new ParameterizedTypeReference<EntityListResponse<SchemeWiseReportResponse>>() {});
  }
}
