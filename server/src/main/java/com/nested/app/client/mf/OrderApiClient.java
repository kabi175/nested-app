package com.nested.app.client.mf;

import com.nested.app.client.finprimitives.EntityListResponse;
import com.nested.app.client.mf.dto.BulkOrderRequest;
import com.nested.app.client.mf.dto.ConfirmOrderRequest;
import com.nested.app.client.mf.dto.OrderData;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

/**
 * @deprecated Use {@link BuyOrderApiClient} and {@link SipOrderApiClient} instead.
 */
@Deprecated(forRemoval = true)
@Service
public interface OrderApiClient {
  Mono<EntityListResponse<OrderData>> placeBulkOrder(BulkOrderRequest request);

  Mono<Void> confirmOrder(ConfirmOrderRequest confirmOrderRequest);
}
