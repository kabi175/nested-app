package com.nested.app.client.tarrakki;

import com.nested.app.client.tarrakki.dto.PaymentsRequest;
import com.nested.app.client.tarrakki.dto.PaymentsResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class PaymentsAPIClient {
  private final RestTemplate restTemplate = new RestTemplate();
  @Value("${tarrakki.api.base.url}")
  private String baseUrl;

  public PaymentsResponse createPayment(PaymentsRequest request) {
    String url = baseUrl + "/payments";
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<PaymentsRequest> entity = new HttpEntity<>(request, headers);
    ResponseEntity<PaymentsResponse> response =
        restTemplate.exchange(url, HttpMethod.POST, entity, PaymentsResponse.class);
    return response.getBody();
  }
}
