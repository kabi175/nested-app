package com.nested.app.client.mf;

import com.nested.app.client.finprimitives.EntityListResponse;
import com.nested.app.client.mf.dto.OrderConsentRequest;
import com.nested.app.client.mf.dto.OrderData;
import com.nested.app.client.mf.dto.OrderDetail;
import java.util.List;
import reactor.core.publisher.Mono;

public interface BuyOrderApiClient {

  Mono<Void> updateConsent(OrderConsentRequest confirmOrderRequest);

  Mono<Void> confirmOrder(List<String> orderIds);

  Mono<EntityListResponse<OrderData>> placeBuyOrder(List<OrderDetail> orders);

  Mono<OrderData> fetchOrderDetails(String orderRef);
}
