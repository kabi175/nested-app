package com.nested.app.client.mf.mock;

import com.nested.app.client.mf.PaymentsAPIClient;
import com.nested.app.client.tarrakki.dto.PaymentsRequest;
import com.nested.app.client.tarrakki.dto.PaymentsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class PaymentsAPIClientImpl implements PaymentsAPIClient {
  @Value("${app.url}")
  private String serverAddress;

  @Override
  public Mono<PaymentsResponse> createPayment(PaymentsRequest request) {
    var resp = new PaymentsResponse();
    resp.setPaymentId("mock_payment" + System.currentTimeMillis());
    resp.setRedirectUrl(serverAddress + "/public/payment/" + resp.getPaymentId());
    return Mono.just(resp);
  }
}
