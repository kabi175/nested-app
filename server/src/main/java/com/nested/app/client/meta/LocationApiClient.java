package com.nested.app.client.meta;

import com.nested.app.client.meta.dto.Location;
import reactor.core.publisher.Mono;

public interface LocationApiClient {
  Mono<Location> fetchLocation(String pinCode);
}
