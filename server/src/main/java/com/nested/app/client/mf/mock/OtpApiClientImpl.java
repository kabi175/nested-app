package com.nested.app.client.mf.mock;

import static com.nested.app.client.mf.mock.Util.generateMockId;

import com.nested.app.client.mf.OtpApiClient;
import com.nested.app.client.tarrakki.dto.OtpRequest;
import com.nested.app.client.tarrakki.dto.OtpResponse;
import com.nested.app.client.tarrakki.dto.OtpVerifyRequest;
import java.time.LocalDateTime;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@Profile("dev")
public class OtpApiClientImpl implements OtpApiClient {

  @Override
  public Mono<OtpResponse> sendOtp(OtpRequest request) {
    var resp = new OtpResponse();
    resp.setOtpId(generateMockId("otp"));
    resp.setOtpType(request.getOtp_type().getValue());
    resp.setInvestorId(request.getInvestor_id());
    resp.setExpiry(LocalDateTime.now().plusMinutes(15));
    return Mono.just(resp);
  }

  @Override
  public Mono<Boolean> verifyOtp(String otpId, OtpVerifyRequest request) {
    if (request.getOtp().equals("123456")) {
      return Mono.just(true);
    }
    return Mono.just(false);
  }
}
