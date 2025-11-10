package com.nested.app.client.finprimitives;

import com.nested.app.client.mf.dto.ActionRequired;
import com.nested.app.client.mf.dto.CreateInvestorRequest;
import com.nested.app.client.mf.dto.EntityResponse;
import com.nested.app.client.mf.dto.FATCAUploadRequest;
import com.nested.app.client.mf.dto.KycCheck;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Primary
@RequiredArgsConstructor
public class KycAPIClient implements com.nested.app.client.mf.KycAPIClient {

  private static final String KYC_REQUEST_API_URL = "/v2/kyc_requests";
  private static final String E_SIGN_API_URL = "/v2/esigns";
  private static final String AADHAAR_UPLOAD_API_URL = "/v2/identity_documents";

  @Value("${app.url}")
  private final String APP_URL;

  private final FinPrimitivesAPI api;

  @Override
  public Mono<KycCheck> isKycRecordAvailable(@NotEmpty String pan, @NotNull Date dob) {
    return api.withAuth()
        .get()
        .uri(KYC_REQUEST_API_URL)
        .attribute("pan", pan)
        .retrieve()
        .bodyToMono(new ParameterizedTypeReference<EntityListResponse<KYCRequest>>() {})
        .map(
            kycGetResponse -> {
              var status =
                  kycGetResponse.data.stream()
                      .findFirst()
                      .map(r -> r.status)
                      .map(KycCheck.Status::fromString)
                      .orElse(KycCheck.Status.NOT_AVAILABLE);

              return KycCheck.builder().pan(pan).status(status).build();
            });
  }

  @Override
  public Mono<EntityResponse> createKyc(CreateInvestorRequest request) {
    return api.withAuth()
        .post()
        .uri(KYC_REQUEST_API_URL)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(EntityResponse.class);
  }

  @Override
  public Mono<Void> updateFATCA(String investorId, FATCAUploadRequest request) {
    return api.withAuth()
        .patch()
        .uri(KYC_REQUEST_API_URL + "/" + investorId)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(Void.class);
  }

  @Override
  public Mono<ActionRequired> createESignRequest(String kycRequestID) {
    var request =
        Map.of("kyc_request", kycRequestID, "postback_url", callbackUrl(kycRequestID, "esign"));
    return api.withAuth()
        .post()
        .uri(E_SIGN_API_URL)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(ActionRequired.class);
  }

  @Override
  public Mono<Boolean> isESignSuccess(String eSignID) {
    return api.withAuth()
        .get()
        .uri(E_SIGN_API_URL + "/" + eSignID)
        .retrieve()
        .bodyToMono(HashMap.class)
        .map(
            resp -> {
              String status = (String) resp.get("status");
              return "successful".equalsIgnoreCase(status);
            });
  }

  @Override
  public Mono<ActionRequired> createAadhaarUploadRequest(String kycRequestID) {
    var proofID = fetchAadhaarDocument(kycRequestID).map(IdentityDocument::getId).block();
    if (proofID != null) {
      return Mono.empty();
    }
    var request =
        Map.of(
            "kyc_request",
            kycRequestID,
            "type",
            "aadhaar",
            "postback_url",
            callbackUrl(kycRequestID, "aadhaar_upload"));
    return api.withAuth()
        .post()
        .uri(AADHAAR_UPLOAD_API_URL)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(ActionRequired.class);
  }

  private Mono<IdentityDocument> fetchAadhaarDocument(String kycRequestID) {
    return api.withAuth()
        .get()
        .uri(AADHAAR_UPLOAD_API_URL)
        .attribute("kyc_request", kycRequestID)
        .attribute("fetch.status", "success")
        .retrieve()
        .bodyToMono(new ParameterizedTypeReference<EntityListResponse<IdentityDocument>>() {})
        .map(
            resp -> {
              if (resp.data.isEmpty()) {
                return null;
              }
              return resp.data.getFirst();
            });
  }

  @Override
  public Mono<Boolean> updateAadhaarProof(String kycRequestID) {
    var proofID = fetchAadhaarDocument(kycRequestID).map(IdentityDocument::getId).block();

    if (proofID == null) {
      return Mono.just(false);
    }

    var request =
        Map.of(
            "identity_proof",
            proofID,
            "address",
            Map.of("proof_type", "aadhaar", "proof", proofID));

    api.withAuth()
        .patch()
        .uri(KYC_REQUEST_API_URL + "/" + kycRequestID)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(Void.class)
        .block();

    return Mono.just(true);
  }

  private String callbackUrl(String kycRequestID, String feature) {
    return APP_URL + "/redirects/kyc/" + kycRequestID + "/" + feature;
  }

  @Data
  public static class IdentityDocument {
    private String id;
    private Map<String, String> fetch;
  }

  public static class EntityListResponse<T> {
    public List<T> data;
  }

  public static class KYCRequest {
    private String id;
    private String status;
  }
}
