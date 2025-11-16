package com.nested.app.client.mf;

import com.nested.app.client.finprimitives.EntityListResponse;
import com.nested.app.client.mf.dto.BulkOrderRequest;
import com.nested.app.client.mf.dto.OrderResponse;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public interface OrderApiClient {
  Mono<EntityListResponse<OrderResponse>> placeBulkOrder(BulkOrderRequest request);
}
