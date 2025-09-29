package com.nested.app.client.tarrakki;

import com.nested.app.client.tarrakki.dto.FundResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class FundAPIClient {
  private final RestTemplate restTemplate = new RestTemplate();
  @Value("${tarrakki.api.funds.url}")
  private String fundsApiUrl;

  // TODO: handle authentication, error handling, logging, etc.

  public FundResponse fetchFundsList() {
    ResponseEntity<FundResponse> response =
        restTemplate.getForEntity(fundsApiUrl, FundResponse.class);
    return response.getBody();
  }
}
