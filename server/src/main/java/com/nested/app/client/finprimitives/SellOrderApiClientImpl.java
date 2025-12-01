package com.nested.app.client.finprimitives;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nested.app.client.mf.SellOrderApiClient;
import com.nested.app.client.mf.dto.OrderConsentRequest;
import com.nested.app.client.mf.dto.OrderData;
import com.nested.app.client.mf.dto.SellOrderDetail;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@RequiredArgsConstructor
public class SellOrderApiClientImpl implements SellOrderApiClient {
  private static final String SELL_ORDER_API_URL = "/v2/mf_redemptions";
  private final FinPrimitivesAPI api;
  private final ObjectMapper objectMapper;

  @Override
  public Mono<Void> updateConsent(OrderConsentRequest confirmOrderRequest) {
    return api.withAuth()
        .patch()
        .uri(SELL_ORDER_API_URL)
        .bodyValue(confirmOrderRequest)
        .retrieve()
        .bodyToMono(Void.class);
  }

  @Override
  public Mono<Void> confirmOrder(List<String> orderIds) {
    var orders =
        orderIds.stream().map(orderID -> Map.of("id", orderID, "state", "confirmed")).toList();
    var request = orders.getFirst();
    return api.withAuth()
        .patch()
        .uri(SELL_ORDER_API_URL)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(Void.class);
  }

  @Override
  public Mono<SellOrderDetail> placeBuyOrder(SellOrderDetail order) {
    try {
      log.info("placeBuyOrder with request: {}", objectMapper.writeValueAsString(order));
    } catch (Exception e) {
      log.warn("Failed to serialize request for logging", e);
    }
    return api.withAuth()
        .post()
        .uri(SELL_ORDER_API_URL)
        .bodyValue(order)
        .retrieve()
        .bodyToMono(SellOrderDetail.class);
  }

  @Override
  public Mono<OrderData> fetchOrderDetails(String orderRef) {
    var resp =
        api.withAuth()
            .get()
            .uri(uriBuilder -> uriBuilder.path(SELL_ORDER_API_URL + "/" + orderRef).build())
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<EntityListResponse<OrderData>>() {})
            .block();

    if (resp == null || resp.data == null || resp.data.isEmpty()) {
      return Mono.empty();
    }

    return Mono.just(resp.data.getFirst());
  }
}
