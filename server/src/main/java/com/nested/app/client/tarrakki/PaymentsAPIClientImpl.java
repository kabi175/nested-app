package com.nested.app.client.tarrakki;

import com.nested.app.client.mf.PaymentsAPIClient;
import com.nested.app.client.mf.dto.PaymentsRequest;
import com.nested.app.client.mf.dto.PaymentsResponse;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import reactor.core.publisher.Mono;

@AllArgsConstructor
public class PaymentsAPIClientImpl implements PaymentsAPIClient {
  private static final String paymentsApiUrl = "/payments";
  private final TarrakkiAPI tarrakkiAPI;

  public Mono<PaymentsResponse> createPayment(@Validated PaymentsRequest request) {
    return tarrakkiAPI
        .withAuth()
        .post()
        .uri(paymentsApiUrl)
        .contentType(MediaType.APPLICATION_JSON)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(PaymentsResponse.class);
  }

  @Override
  public Mono<PaymentsResponse> fetchPayment(String paymentID) {
    return null;
  }
}
