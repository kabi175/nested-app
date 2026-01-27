package com.nested.app.client.mf;

import com.nested.app.client.mf.dto.ActionRequired;
import com.nested.app.client.mf.dto.CreateKYCRequest;
import com.nested.app.client.mf.dto.EntityResponse;
import com.nested.app.client.mf.dto.FATCAUploadRequest;
import com.nested.app.client.mf.dto.KycCheck;
import reactor.core.publisher.Mono;

public interface KycAPIClient {
  Mono<KycCheck> isKycRecordAvailable(String pan);

  Mono<EntityResponse> createKyc(CreateKYCRequest request);

  Mono<Void> updateFATCA(String investorId, FATCAUploadRequest request);

  Mono<ActionRequired> createESignRequest(String kycRequestID);

  Mono<Boolean> isESignSuccess(String eSignID);

  Mono<ActionRequired> createAadhaarUploadRequest(String kycRequestID);

  Mono<Boolean> updateAadhaarProof(String kycRequestID);

  Mono<Void> completeKycRequest(String kycRequestID);
}
