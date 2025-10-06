package com.nested.app.client.tarrakki;

import com.nested.app.client.tarrakki.dto.*;
import java.text.MessageFormat;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientException;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class OtpApiClient {

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

  public Mono<Boolean> verifyOtp(String otpId, OtpVerifyRequest request) {
    try {
      tarrakkiAPI
          .withAuth()
          .post()
          .uri(MessageFormat.format("/otp/{0}/verify", otpId))
          .body(request, OtpVerifyRequest.class)
          .retrieve()
          .toBodilessEntity();

      return Mono.just(true);

    } catch (WebClientException e) {
      return Mono.just(false);
    }
  }
}
