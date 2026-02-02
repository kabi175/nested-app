package com.nested.app.client.msg91;

import com.nested.app.client.SmsService;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Slf4j
@Service
public class SmsServiceImpl implements SmsService {

  private final String baseUrl = "https://control.msg91.com/api/v5";

  @Value("msg91.otp.template")
  private String templateID;

  @Value("msg91.auth-token")
  private String authToken;

  public WebClient withAuth() {
    log.debug("Creating WebClient for WebClient with baseUrl={}", baseUrl);
    return WebClient.builder().baseUrl(baseUrl).defaultHeader("authkey", authToken).build();
  }

  @Override
  public void sendOTP(String fromPhoneNumber, String toPhoneNumber, String otp) {
    log.info("toPhoneNumber={}", toPhoneNumber);
    var recipients = List.of(Map.of("mobiles", toPhoneNumber, "var1", otp));
    var body = Map.of("template_id", templateID, "short_url", "0", "recipients", recipients);
    withAuth().post().uri("/flow").bodyValue(body).retrieve().bodyToMono(Void.class).block();
  }
}
