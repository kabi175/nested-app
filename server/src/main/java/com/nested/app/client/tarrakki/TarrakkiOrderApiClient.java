package com.nested.app.client.tarrakki;

import com.nested.app.client.tarrakki.dto.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class TarrakkiOrderApiClient {
  private final RestTemplate restTemplate = new RestTemplate();

  @Value("${tarrakki.api.base.url}")
  private String baseUrl;

  public OtpResponse sendOtp(OtpRequest request) {
    String url = baseUrl + "/otp";
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<OtpRequest> entity = new HttpEntity<>(request, headers);
    ResponseEntity<OtpResponse> response =
        restTemplate.exchange(url, HttpMethod.POST, entity, OtpResponse.class);
    return response.getBody();
  }

  public OtpResponse verifyOtp(String otpId, OtpVerifyRequest request) {
    String url = baseUrl + "/otp/" + otpId + "/verify";
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<OtpVerifyRequest> entity = new HttpEntity<>(request, headers);
    ResponseEntity<OtpResponse> response =
        restTemplate.exchange(url, HttpMethod.POST, entity, OtpResponse.class);
    return response.getBody();
  }

  public OrderResponse placeOrder(OrderRequest request) {
    String url = baseUrl + "/orders";
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    HttpEntity<OrderRequest> entity = new HttpEntity<>(request, headers);
    ResponseEntity<OrderResponse> response =
        restTemplate.exchange(url, HttpMethod.POST, entity, OrderResponse.class);
    return response.getBody();
  }
}
