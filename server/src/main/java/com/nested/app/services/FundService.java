package com.nested.app.services;

import com.nested.app.dto.FundResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class FundService {
  private final RestTemplate restTemplate = new RestTemplate();
  @Value("${tarrakki.api.funds.url}")
  private String fundsApiUrl;

  public FundResponse fetchFundsList() {
    ResponseEntity<FundResponse> response =
        restTemplate.getForEntity(fundsApiUrl, FundResponse.class);
    return response.getBody();
  }
}
