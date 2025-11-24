package com.nested.app.client.finprimitives;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nested.app.client.mf.PaymentsAPIClient;
import com.nested.app.client.mf.dto.PaymentsRequest;
import com.nested.app.client.mf.dto.PaymentsResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentApiImpl implements PaymentsAPIClient {
  private static final String PAYMENT_API_URL = "/api/pg/payments";
  private static final String NET_BANKING = "netbanking";
  private static final String UPI = "upi";

  private final FinPrimitivesAPI api;
  private final ObjectMapper objectMapper;

  @Override
  public Mono<PaymentsResponse> createPayment(PaymentsRequest request) {
    var paymentMethod =
        request.getPaymentMethod() == PaymentsRequest.PaymentMethod.UPI ? UPI : NET_BANKING;
    try {
      log.info(
          "Initiating payment creation: method={}, request={}",
          paymentMethod,
          objectMapper.writeValueAsString(request));
    } catch (Exception e) {
      log.warn("Failed to serialize request for logging", e);
    }

    //    request.setCallback_url(callbackUrl());

    return api.withAuth()
        .post()
        .uri(PAYMENT_API_URL + "/" + paymentMethod)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(PaymentsResponse.class)
        .doOnSuccess(
            resp ->
                log.info(
                    "Payment created successfully. method={}, response={}", paymentMethod, resp))
        .doOnError(
            ex ->
                log.error(
                    "Failed to create payment. method={}, error={}",
                    paymentMethod,
                    ex.getMessage(),
                    ex));
  }

  @Override
  public Mono<PaymentsResponse> fetchPayment(String paymentID) {
    return api.withAuth().get().uri(PAYMENT_API_URL).retrieve().bodyToMono(PaymentsResponse.class);
  }
}
