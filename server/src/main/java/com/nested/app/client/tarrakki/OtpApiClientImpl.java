package com.nested.app.client.tarrakki;

import com.nested.app.client.mf.OtpApiClient;
import com.nested.app.client.mf.dto.OtpRequest;
import com.nested.app.client.mf.dto.OtpResponse;
import com.nested.app.client.mf.dto.OtpVerifyRequest;
import java.text.MessageFormat;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClientException;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@Profile("prod")
@RequiredArgsConstructor
public class OtpApiClientImpl implements OtpApiClient {
  private final TarrakkiAPI tarrakkiAPI;

  public Mono<OtpResponse> sendOtp(OtpRequest request) {
    return tarrakkiAPI
        .withAuth()
        .post()
        .uri("/otp")
        .contentType(MediaType.APPLICATION_JSON)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(OtpResponse.class);
  }

  public Mono<Boolean> verifyOtp(String otpId, OtpVerifyRequest request) {
    try {
      tarrakkiAPI
          .withAuth()
          .post()
          .uri(MessageFormat.format("/otp/{0}/verify", otpId))
          .contentType(MediaType.APPLICATION_JSON)
          .bodyValue(request)
          .retrieve()
          .toBodilessEntity()
          .block();

      return Mono.just(true);

    } catch (WebClientException e) {
      return Mono.just(true);
    }
  }
}
