package com.nested.app.client.tarrakki;

import com.nested.app.client.tarrakki.dto.PaymentsRequest;
import com.nested.app.client.tarrakki.dto.PaymentsResponse;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import reactor.core.publisher.Mono;

@Service
public interface PaymentsAPIClient {
  Mono<PaymentsResponse> createPayment(@Validated PaymentsRequest request);
}
