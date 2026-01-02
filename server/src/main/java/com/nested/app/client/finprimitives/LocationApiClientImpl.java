package com.nested.app.client.finprimitives;

import com.nested.app.client.meta.LocationApiClient;
import com.nested.app.client.meta.dto.Location;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@RequiredArgsConstructor
public class LocationApiClientImpl implements LocationApiClient {
  private static final String PIN_CODE_API_URL = "/api/onb/pincodes";
  private final FinPrimitivesAPI api;

  @Override
  public Mono<Location> fetchLocation(String pinCode) {
    return api.withAuth()
        .get()
        .uri(PIN_CODE_API_URL + "/" + pinCode)
        .retrieve()
        .bodyToMono(Location.class);
  }
}
