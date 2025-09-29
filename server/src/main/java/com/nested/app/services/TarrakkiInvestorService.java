package com.nested.app.services;

import com.nested.app.dto.BankAccountRequest;
import com.nested.app.dto.NomineeRequest;
import com.nested.app.dto.TarrakkiInvestorRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class TarrakkiInvestorService {
  private final RestTemplate restTemplate = new RestTemplate();

  // TODO: handle authentication, error handling, logging, etc.
  @Value("${tarrakki.api.investor.url}")
  private String investorApiUrl;

  public ResponseEntity<String> createInvestor(TarrakkiInvestorRequest request) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    // Add authorization if needed: headers.set("Authorization", "Bearer <token>");
    HttpEntity<TarrakkiInvestorRequest> entity = new HttpEntity<>(request, headers);
    return restTemplate.exchange(investorApiUrl, HttpMethod.POST, entity, String.class);
  }

  public ResponseEntity<String> updateInvestor(Long investorId, TarrakkiInvestorRequest request) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    // Add authorization if needed: headers.set("Authorization", "Bearer <token>");
    String url = investorApiUrl + "/" + investorId;
    HttpEntity<TarrakkiInvestorRequest> entity = new HttpEntity<>(request, headers);
    return restTemplate.exchange(url, HttpMethod.PATCH, entity, String.class);
  }

  public ResponseEntity<String> addBankForInvestor(Long investorId, BankAccountRequest request) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.MULTIPART_FORM_DATA);
    // Add authorization if needed: headers.set("Authorization", "Bearer <token>");
    String url = investorApiUrl + "/" + investorId + "/bank";

    MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
    body.add("account_type", request.getAccount_type().name().toLowerCase());
    body.add("account_number", request.getAccount_number());
    body.add("ifsc", request.getIfsc());
    body.add("verification_document", request.getVerification_document().name().toLowerCase());
    body.add("file", request.getFile());

    HttpEntity<MultiValueMap<String, Object>> entity = new HttpEntity<>(body, headers);
    return restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
  }

  public ResponseEntity<String> addNomineesForInvestor(Long investorId, NomineeRequest request) {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    // Add authorization if needed: headers.set("Authorization", "Bearer <token>");
    String url = investorApiUrl + "/" + investorId + "/nominees";
    HttpEntity<NomineeRequest> entity = new HttpEntity<>(request, headers);
    return restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
  }
}
