package com.nested.app.client.tarrakki;

import com.nested.app.client.mf.OrderApiClient;
import com.nested.app.client.tarrakki.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Profile("prod")
@RequiredArgsConstructor
public class OrderApiClientImpl implements OrderApiClient {

  private final TarrakkiAPI tarrakkiAPI;

  public Mono<OrderResponse> placeBulkOrder(BulkOrderRequest request) {
    return tarrakkiAPI
        .withAuth()
        .post()
        .uri("/bulk-orders")
        .bodyValue(request)
        .retrieve()
        .bodyToMono(OrderResponse.class);
  }
}
