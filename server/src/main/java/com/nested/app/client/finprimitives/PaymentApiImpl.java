package com.nested.app.client.finprimitives;

import com.nested.app.client.mf.PaymentsAPIClient;
import com.nested.app.client.mf.dto.PaymentsRequest;
import com.nested.app.client.mf.dto.PaymentsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class PaymentApiImpl implements PaymentsAPIClient {
  private static final String PAYMENT_API_URL = "/api/pg/payments";
  private static final String NET_BANKING = "netbanking";
  private static final String UPI = "upi";

  private final FinPrimitivesAPI api;

  @Override
  public Mono<PaymentsResponse> createPayment(PaymentsRequest request) {
    var paymentMethod =
        request.getPaymentMethod() == PaymentsRequest.PaymentMethod.UPI ? UPI : NET_BANKING;
    return api.withAuth()
        .post()
        .uri(PAYMENT_API_URL + "/" + paymentMethod)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(PaymentsResponse.class);
  }

  @Override
  public Mono<PaymentsResponse> fetchPayment(String paymentID) {
    return api.withAuth().get().uri(PAYMENT_API_URL).retrieve().bodyToMono(PaymentsResponse.class);
  }
}
