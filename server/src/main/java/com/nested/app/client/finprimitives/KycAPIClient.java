package com.nested.app.client.finprimitives;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.client.mf.dto.ActionRequired;
import com.nested.app.client.mf.dto.CreateKYCRequest;
import com.nested.app.client.mf.dto.EntityResponse;
import com.nested.app.client.mf.dto.FATCAUploadRequest;
import com.nested.app.client.mf.dto.KycCheck;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.Date;
import java.util.Map;
import java.util.Objects;
import java.util.function.Predicate;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Primary
@Slf4j
@RequiredArgsConstructor
public class KycAPIClient implements com.nested.app.client.mf.KycAPIClient {

  private static final String KYC_REQUEST_API_URL = "/v2/kyc_requests";
  private static final String E_SIGN_API_URL = "/v2/esigns";
  private static final String AADHAAR_UPLOAD_API_URL = "/v2/identity_documents";
  private final FinPrimitivesAPI api;

  @Value("${app.url}")
  private String APP_URL;

  @Override
  public Mono<KycCheck> isKycRecordAvailable(@NotEmpty String pan, @NotNull Date dob) {
    return api.withAuth()
        .get()
        .uri(uriBuilder -> uriBuilder.path(KYC_REQUEST_API_URL).queryParam("pan", pan).build())
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
  public Mono<EntityResponse> createKyc(CreateKYCRequest request) {
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

  public Mono<EntityListResponse<ESign>> fetchESignSuccess(String kycRequestID) {
    return api.withAuth()
        .get()
        .uri(
            uriBuilder ->
                uriBuilder.path(E_SIGN_API_URL).queryParam("kyc_request", kycRequestID).build())
        .retrieve()
        .bodyToMono(new ParameterizedTypeReference<EntityListResponse<ESign>>() {});
  }

  @Override
  public Mono<ActionRequired> createESignRequest(String kycRequestID) {
    var resp = fetchESignSuccess(kycRequestID).block();
    if (resp != null) {
      var pendingRequest = resp.data.stream().filter(Predicate.not(ESign::isSuccess)).findFirst();

      if (pendingRequest.isPresent()) {
        return Mono.just(
            ActionRequired.builder()
                .type("e_sign")
                .id(pendingRequest.get().id)
                .redirectUrl(pendingRequest.get().redirectUrl)
                .build());
      }

      var successRequest = resp.data.stream().filter(ESign::isSuccess).findFirst();

      if (successRequest.isPresent()) {
        return Mono.just(
            ActionRequired.builder()
                .type("e_sing")
                .id(successRequest.get().id)
                .completed(true)
                .build());
      }
    }

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
        .bodyToMono(ESign.class)
        .map(ESign::isSuccess);
  }

  @Override
  public Mono<ActionRequired> createAadhaarUploadRequest(String kycRequestID) {
    var proofID =
        fetchAadhaarDocument(kycRequestID)
            .filter(Objects::nonNull)
            .map(IdentityDocument::getId)
            .block();
    if (proofID != null) {
      return Mono.just(ActionRequired.builder().id(proofID).completed(true).build());
    }
    var proof = fetchAadhaarDocument(kycRequestID, "pending").block();
    if (proof != null) {
      return Mono.just(
          ActionRequired.builder()
              .id(proof.getId())
              .redirectUrl(proof.getFetch().get("redirect_url"))
              .build());
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
        .bodyToMono(new ParameterizedTypeReference<EntityListResponse<IdentityDocument>>() {})
        .flatMap(
            resp -> {
              if (resp == null || resp.data.isEmpty()) {
                return Mono.empty();
              }
              var data = resp.data.getFirst();
              return Mono.just(
                  ActionRequired.builder()
                      .id(data.id)
                      .redirectUrl(data.getFetch().get("redirect_url"))
                      .build());
            });
  }

  private Mono<IdentityDocument> fetchAadhaarDocument(String kycRequestID) {
    return fetchAadhaarDocument(kycRequestID, "successful");
  }

  private Mono<IdentityDocument> fetchAadhaarDocument(String kycRequestID, String status) {
    return api.withAuth()
        .get()
        .uri(
            uriBuilder ->
                uriBuilder
                    .queryParam("kyc_request", kycRequestID)
                    .queryParam("fetch.status", status)
                    .path(AADHAAR_UPLOAD_API_URL)
                    .build())
        .retrieve()
        .bodyToMono(new ParameterizedTypeReference<EntityListResponse<IdentityDocument>>() {})
        .flatMap(
            resp -> {
              if (resp.data.isEmpty()) {
                return Mono.empty();
              }
              return Mono.just(resp.data.getFirst());
            });
  }

  @Override
  public Mono<Boolean> updateAadhaarProof(String kycRequestID) {
    var proofID =
        fetchAadhaarDocument(kycRequestID)
            .filter(Objects::nonNull)
            .map(IdentityDocument::getId)
            .block();

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

  @Override
  public Mono<Void> completeKycRequest(String kycRequestID) {
    return api.withAuth()
        .patch()
        .uri(KYC_REQUEST_API_URL + "/" + kycRequestID + "/simulate")
        .bodyValue(Map.of("status", "successful"))
        .retrieve()
        .bodyToMono(Void.class);
  }

  private String callbackUrl(String kycRequestID, String feature) {
    return APP_URL + "/redirects/kyc/" + kycRequestID + "/" + feature;
  }

  @Data
  public static class IdentityDocument {
    private String id;
    private Map<String, String> fetch;
  }

  @Data
  public static class ESign {
    private String id;

    @JsonProperty("redirect_url")
    private String redirectUrl;

    private String status;

    private boolean isSuccess() {
      return "successful".equalsIgnoreCase(status);
    }
  }

  @Data
  public static class KYCRequest {
    private String id;
    private String status;
  }
}
