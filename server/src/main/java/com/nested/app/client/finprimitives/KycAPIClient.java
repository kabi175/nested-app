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
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Primary
@RequiredArgsConstructor
public class KycAPIClient implements com.nested.app.client.mf.KycAPIClient {

  private static final String KYC_REQUEST_API_URL = "/v2/kyc_requests";
  private static final String E_SIGN_API_URL = "/v2/esigns";
  private static final String AADHAAR_UPLOAD_API_URL = "/v2/identity_documents";

  private final FinPrimitivesAPI api;

  @Override
  public Mono<KycCheck> isKycRecordAvailable(@NotEmpty String pan, @NotNull Date dob) {
    return api.withAuth()
        .get()
        .uri(KYC_REQUEST_API_URL)
        .attribute("pan", pan)
        .retrieve()
        .bodyToMono(KYCGetResponse.class)
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
    var request = Map.of("kyc_request", kycRequestID);
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
    var request = Map.of("kyc_request", kycRequestID, "type", "aadhaar");
    return api.withAuth()
        .post()
        .uri(AADHAAR_UPLOAD_API_URL)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(ActionRequired.class);
  }

  @Override
  public Mono<Boolean> isAadhaarUploadSuccess(String uploadRequestID) {
    return api.withAuth()
        .get()
        .uri(AADHAAR_UPLOAD_API_URL + "/" + uploadRequestID)
        .retrieve()
        .bodyToMono(HashMap.class)
        .map(
            resp -> {
              if (!resp.containsKey("status")) {
                return false;
              }
              Map<String, ?> fetch = (Map<String, ?>) resp.get("status");
              var status = (String) fetch.get("status");
              return "successful".equalsIgnoreCase(status);
            });
  }

  public static class KYCGetResponse {
    public List<KYCRequest> data;

    public static class KYCRequest {
      private String id;
      private String status;
    }
  }
}
