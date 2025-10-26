package com.nested.app.client.mf;

import com.nested.app.client.tarrakki.dto.BulkOrderRequest;
import com.nested.app.client.tarrakki.dto.OrderResponse;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public interface OrderApiClient {
  Mono<OrderResponse> placeBulkOrder(BulkOrderRequest request);
}
