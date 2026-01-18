package com.nested.app.client.mf;

import com.nested.app.client.mf.dto.EntityResponse;
import com.nested.app.client.mf.dto.KycVerificationRequest;
import com.nested.app.client.mf.dto.KycVerificationResponse;
import reactor.core.publisher.Mono;

public interface KycVerificationAPIClient {
  Mono<EntityResponse> create(KycVerificationRequest request);

  Mono<KycVerificationResponse> fetch(String ref);
}
