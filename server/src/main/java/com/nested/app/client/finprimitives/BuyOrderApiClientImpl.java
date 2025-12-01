package com.nested.app.client.finprimitives;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nested.app.client.mf.BuyOrderApiClient;
import com.nested.app.client.mf.dto.OrderConsentRequest;
import com.nested.app.client.mf.dto.OrderData;
import com.nested.app.client.mf.dto.OrderDetail;
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
public class BuyOrderApiClientImpl implements BuyOrderApiClient {
  private static final String BUY_ORDER_BATCH_API_URL = "/v2/mf_purchases/batch";
  private static final String BUY_ORDER_API_URL = "/v2/mf_purchases";
  private final FinPrimitivesAPI api;
  private final ObjectMapper objectMapper;

  @Override
  public Mono<EntityListResponse<OrderData>> placeBuyOrder(List<OrderDetail> orders) {
    try {
      log.info("placeBuyOrder with request: {}", objectMapper.writeValueAsString(orders));
    } catch (Exception e) {
      log.warn("Failed to serialize request for logging", e);
    }

    return api.withAuth()
        .post()
        .uri(BUY_ORDER_BATCH_API_URL)
        .bodyValue(Map.of("mf_purchases", orders))
        .retrieve()
        .bodyToMono(new ParameterizedTypeReference<>() {});
  }

  @Override
  public Mono<OrderData> fetchOrderDetails(String orderRef) {
    var resp =
        api.withAuth()
            .get()
            .uri(uriBuilder -> uriBuilder.path(BUY_ORDER_API_URL + "/" + orderRef).build())
            .retrieve()
            .bodyToMono(new ParameterizedTypeReference<EntityListResponse<OrderData>>() {})
            .block();

    if (resp == null || resp.data == null || resp.data.isEmpty()) {
      return Mono.empty();
    }

    return Mono.just(resp.data.getFirst());
  }

  @Override
  public Mono<Void> updateConsent(OrderConsentRequest request) {
    return api.withAuth()
        .patch()
        .uri(BUY_ORDER_API_URL)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(Void.class);
  }

  @Override
  public Mono<Void> confirmOrder(List<String> orderIds) {
    var orders =
        orderIds.stream().map(orderID -> Map.of("id", orderID, "state", "confirmed")).toList();
    var request = Map.of("mf_purchases", orders);
    return api.withAuth()
        .patch()
        .uri(BUY_ORDER_BATCH_API_URL)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(Void.class);
  }

}
