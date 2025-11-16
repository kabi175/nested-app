package com.nested.app.client.finprimitives;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nested.app.client.mf.BuyOrderApiClient;
import com.nested.app.client.mf.dto.ConfirmOrderRequest;
import com.nested.app.client.mf.dto.OrderDetail;
import com.nested.app.client.mf.dto.OrderResponse;
import java.util.HashMap;
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
  private final FinPrimitivesAPI api;
  private final ObjectMapper objectMapper;

  @Override
  public Mono<EntityListResponse<OrderResponse>> placeBuyOrder(List<OrderDetail> orders) {
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
  public Mono<Void> confirmBuyOrder(ConfirmOrderRequest confirmOrderRequest) {
    if (confirmOrderRequest.getBuyOrders() == null
        || confirmOrderRequest.getBuyOrders().isEmpty()) {
      return Mono.empty();
    }
    var orders =
        confirmOrderRequest.getBuyOrders().stream()
            .map(orderID -> convertToConfirmData(confirmOrderRequest, orderID))
            .toList();

    try {
      log.info("confirmBuyOrder with request: {}", objectMapper.writeValueAsString(orders));
    } catch (Exception e) {
      log.warn("Failed to serialize request for logging", e);
    }

    return api.withAuth()
        .patch()
        .uri(BUY_ORDER_BATCH_API_URL)
        .bodyValue(Map.of("mf_purchases", orders))
        .retrieve()
        .bodyToMono(new ParameterizedTypeReference<>() {});
  }

  private Map<String, Object> convertToConfirmData(
      ConfirmOrderRequest confirmOrderRequest, String orderID) {
    var consent = new HashMap<String, String>();

    if (confirmOrderRequest.getEmail() != null) {
      consent.put("email", confirmOrderRequest.getEmail());
    }
    if (confirmOrderRequest.getMobile() != null) {
      consent.put("mobile", confirmOrderRequest.getMobile());
    }

    return Map.of("id", orderID, "consent", consent);
  }
}
