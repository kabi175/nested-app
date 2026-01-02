package com.nested.app.client.meta;

import com.nested.app.client.meta.dto.IfscData;
import reactor.core.publisher.Mono;

public interface BankApiClient {
  Mono<IfscData> fetchIfscData(String ifscCode);
}
