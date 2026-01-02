package com.nested.app.client.mf;

import com.nested.app.client.mf.dto.PaymentsRequest;
import com.nested.app.client.mf.dto.PaymentsResponse;
import org.springframework.validation.annotation.Validated;
import reactor.core.publisher.Mono;

public interface PaymentsAPIClient {
  Mono<PaymentsResponse> createPayment(@Validated PaymentsRequest request);

  Mono<PaymentsResponse> fetchPayment(String paymentID);
}
