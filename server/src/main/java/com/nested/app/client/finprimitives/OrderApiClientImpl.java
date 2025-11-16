package com.nested.app.client.finprimitives;

import com.nested.app.client.mf.OrderApiClient;
import com.nested.app.client.mf.dto.BulkOrderRequest;
import com.nested.app.client.mf.dto.OrderDetail;
import com.nested.app.client.mf.dto.OrderResponse;
import com.nested.app.client.mf.dto.SipOrderDetail;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import reactor.core.publisher.Mono;

@RequiredArgsConstructor
public class OrderApiClientImpl implements OrderApiClient {
  private static final String BUY_ORDER_API_URL = "/v2/mf_purchases";
  private static final String SIP_ORDER_API_URL = "/v2/mf_purchase_plans";
  private final FinPrimitivesAPI api;

  @Override
  public Mono<EntityListResponse<OrderResponse>> placeBulkOrder(BulkOrderRequest request) {
    List<OrderDetail> buyOrders = filterBuyOrders(request.getDetail());
    List<SipOrderDetail> sipOrders = filterSipOrders(request.getDetail());

    Mono<List<OrderResponse>> buyOrdersMono =
        placeBuyOrder(buyOrders).map(response -> response.data).defaultIfEmpty(List.of());

    Mono<List<OrderResponse>> sipOrdersMono =
        placeSIPOrder(sipOrders).map(response -> response.data).defaultIfEmpty(List.of());

    return Mono.zip(buyOrdersMono, sipOrdersMono)
        .map(
            tuple -> {
              List<OrderResponse> combinedResults = new ArrayList<>();
              combinedResults.addAll(tuple.getT1());
              combinedResults.addAll(tuple.getT2());
              return new EntityListResponse<>(combinedResults);
            });
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

  public Mono<EntityListResponse<OrderResponse>> placeBuyOrder(List<OrderDetail> orders) {
    return api.withAuth()
        .post()
        .uri(BUY_ORDER_API_URL)
        .bodyValue(Map.of("mf_purchases", orders))
        .retrieve()
        .bodyToMono(new ParameterizedTypeReference<>() {});
  }

  public Mono<EntityListResponse<OrderResponse>> placeSIPOrder(List<SipOrderDetail> orders) {
    return api.withAuth()
        .post()
        .uri(SIP_ORDER_API_URL)
        .bodyValue(Map.of("mf_purchase_plans", orders))
        .retrieve()
        .bodyToMono(new ParameterizedTypeReference<>() {});
  }
}
