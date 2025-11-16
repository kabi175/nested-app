package com.nested.app.client.finprimitives;

import com.nested.app.client.mf.OrderApiClient;
import com.nested.app.client.mf.dto.BulkOrderRequest;
import com.nested.app.client.mf.dto.ConfirmOrderRequest;
import com.nested.app.client.mf.dto.OrderDetail;
import com.nested.app.client.mf.dto.OrderResponse;
import com.nested.app.client.mf.dto.SipOrderDetail;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

/**
 * @deprecated Use {@link BuyOrderApiClientImpl} and {@link SipOrderApiClientImpl} directly. This
 *     class is kept for backward compatibility.
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Deprecated(forRemoval = true)
public class OrderApiClientImpl implements OrderApiClient {
  private final BuyOrderApiClientImpl buyOrderApiClient;
  private final SipOrderApiClientImpl sipOrderApiClient;

  @Override
  public Mono<EntityListResponse<OrderResponse>> placeBulkOrder(BulkOrderRequest request) {
    List<OrderDetail> buyOrders = filterBuyOrders(request.getDetail());
    List<SipOrderDetail> sipOrders = filterSipOrders(request.getDetail());

    Mono<List<OrderResponse>> buyOrdersMono =
        buyOrderApiClient
            .placeBuyOrder(buyOrders)
            .map(response -> response.data)
            .defaultIfEmpty(List.of());

    Mono<List<OrderResponse>> sipOrdersMono =
        sipOrderApiClient
            .placeSipOrder(sipOrders)
            .map(response -> response.data)
            .defaultIfEmpty(List.of());

    return Mono.zip(buyOrdersMono, sipOrdersMono)
        .map(
            tuple -> {
              List<OrderResponse> combinedResults = new ArrayList<>();
              combinedResults.addAll(tuple.getT1());
              combinedResults.addAll(tuple.getT2());
              return new EntityListResponse<>(combinedResults);
            });
  }

  @Override
  public Mono<Void> confirmOrder(ConfirmOrderRequest confirmOrderRequest) {
    buyOrderApiClient.confirmBuyOrder(confirmOrderRequest).block();
    return Mono.empty();
  }

  private List<OrderDetail> filterBuyOrders(List<OrderDetail> orders) {
    return orders.stream()
        .filter(o -> o.getOrder_type().equals(OrderDetail.OrderType.BUY))
        .toList();
  }

  private List<SipOrderDetail> filterSipOrders(List<OrderDetail> orders) {
    return orders.stream()
        .filter(o -> o.getOrder_type().equals(OrderDetail.OrderType.SIP))
        .filter(SipOrderDetail.class::isInstance)
        .map(SipOrderDetail.class::cast)
        .toList();
  }
}
