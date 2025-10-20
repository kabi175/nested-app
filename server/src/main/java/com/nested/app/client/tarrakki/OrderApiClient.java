package com.nested.app.client.tarrakki;

import com.nested.app.client.tarrakki.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class OrderApiClient {

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
