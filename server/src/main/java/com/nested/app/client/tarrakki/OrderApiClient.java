package com.nested.app.client.tarrakki;

import com.nested.app.client.tarrakki.dto.*;
import java.text.MessageFormat;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class OrderApiClient {

  private final TarrakkiAPI tarrakkiAPI;

  public Mono<OtpResponse> sendOtp(OtpRequest request) {
    return tarrakkiAPI
        .withAuth()
        .post()
        .uri("/otp")
        .body(request, OtpRequest.class)
        .retrieve()
        .bodyToMono(OtpResponse.class);
  }

  public Mono<OtpResponse> verifyOtp(String otpId, OtpVerifyRequest request) {
    return tarrakkiAPI
        .withAuth()
        .post()
        .uri(MessageFormat.format("/otp/{0}/verify", otpId))
        .body(request, OtpVerifyRequest.class)
        .retrieve()
        .bodyToMono(OtpResponse.class);
  }

  public Mono<OrderResponse> placeOrder(OrderRequest request) {
    return tarrakkiAPI
        .withAuth()
        .post()
        .uri("/orders")
        .body(request, OrderRequest.class)
        .retrieve()
        .bodyToMono(OrderResponse.class);
  }
}
