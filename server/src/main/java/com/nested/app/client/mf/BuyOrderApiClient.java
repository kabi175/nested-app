package com.nested.app.client.mf;

import com.nested.app.client.finprimitives.EntityListResponse;
import com.nested.app.client.mf.dto.ConfirmOrderRequest;
import com.nested.app.client.mf.dto.OrderDetail;
import com.nested.app.client.mf.dto.OrderResponse;
import java.util.List;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public interface BuyOrderApiClient {
  Mono<Void> confirmBuyOrder(ConfirmOrderRequest confirmOrderRequest);

  Mono<EntityListResponse<OrderResponse>> placeBuyOrder(List<OrderDetail> orders);
}
