package com.nested.app.client.mf;

import com.nested.app.client.mf.dto.ActionRequired;
import com.nested.app.client.mf.dto.MandateDto;
import reactor.core.publisher.Mono;

public interface MandateApiClient {
  Mono<MandateDto> createMandate(MandateDto dto);

  Mono<MandateDto> fetchMandate(Long id);

  Mono<ActionRequired> authorizeMandate(Long id);
}
