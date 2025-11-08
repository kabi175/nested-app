package com.nested.app.client.mf;

import com.nested.app.client.mf.dto.OtpRequest;
import com.nested.app.client.mf.dto.OtpResponse;
import com.nested.app.client.mf.dto.OtpVerifyRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public interface OtpApiClient {
  Mono<OtpResponse> sendOtp(OtpRequest request);

  Mono<Boolean> verifyOtp(String otpId, OtpVerifyRequest request);
}
