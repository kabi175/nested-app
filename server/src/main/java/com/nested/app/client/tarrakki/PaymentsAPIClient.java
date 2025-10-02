package com.nested.app.client.tarrakki;

import com.nested.app.client.tarrakki.dto.PaymentsRequest;
import com.nested.app.client.tarrakki.dto.PaymentsResponse;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class PaymentsAPIClient {
  private final RestTemplate restTemplate = new RestTemplate();
  private static final String paymentsApiUrl = "/payments";

  public PaymentsResponse createPayment(PaymentsRequest request) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<PaymentsRequest> entity = new HttpEntity<>(request, headers);
    ResponseEntity<PaymentsResponse> response =
        restTemplate.exchange(paymentsApiUrl, HttpMethod.POST, entity, PaymentsResponse.class);
    return response.getBody();
  }
}
