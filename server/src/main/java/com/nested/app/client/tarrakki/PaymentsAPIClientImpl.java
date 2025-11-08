package com.nested.app.client.tarrakki;

import com.nested.app.client.mf.PaymentsAPIClient;
import com.nested.app.client.mf.dto.PaymentsRequest;
import com.nested.app.client.mf.dto.PaymentsResponse;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.validation.annotation.Validated;
import reactor.core.publisher.Mono;

@Profile("prod")
@Component
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
}
