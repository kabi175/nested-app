package com.nested.app.client.mf;

import com.nested.app.client.tarrakki.dto.OtpRequest;
import com.nested.app.client.tarrakki.dto.OtpResponse;
import com.nested.app.client.tarrakki.dto.OtpVerifyRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public interface OtpApiClient {
  Mono<OtpResponse> sendOtp(OtpRequest request);

  Mono<Boolean> verifyOtp(String otpId, OtpVerifyRequest request);
}
