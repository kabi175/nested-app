package com.nested.app.client.finprimitives;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nested.app.client.mf.OrderApiClient;
import com.nested.app.client.mf.dto.BulkOrderRequest;
import com.nested.app.client.mf.dto.ConfirmOrderRequest;
import com.nested.app.client.mf.dto.OrderDetail;
import com.nested.app.client.mf.dto.OrderResponse;
import com.nested.app.client.mf.dto.SipOrderDetail;
import java.util.ArrayList;
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
public class OrderApiClientImpl implements OrderApiClient {
  private static final String BUY_ORDER_BATCH_API_URL = "/v2/mf_purchases/batch";
  private static final String SIP_ORDER_API_URL = "/v2/mf_purchase_plans/batch";
  private final FinPrimitivesAPI api;
  private final ObjectMapper objectMapper;

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

  @Override
  public Mono<Void> confirmOrder(ConfirmOrderRequest confirmOrderRequest) {
    //    Mono.zip(confirmBuyOrder(confirmOrderRequest),
    // confirmSIPOrder(confirmOrderRequest)).block();
    confirmBuyOrder(confirmOrderRequest).block();
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

  private Map<String, Object> convertToConfirmData(
      ConfirmOrderRequest confirmOrderRequest, String orderID) {
    var consent = new HashMap<String, String>();

    if (confirmOrderRequest.getEmail() != null) {
      consent.put("email", confirmOrderRequest.getEmail());
    }
    if (confirmOrderRequest.getMobile() != null) {
      consent.put("mobile", confirmOrderRequest.getMobile());
    }

    return Map.of("id", orderID, "state", "confirmed", "consent", consent);
  }

  public Mono<Void> confirmBuyOrder(ConfirmOrderRequest confirmOrderRequest) {
    if (confirmOrderRequest.getBuyOrders() == null
        || confirmOrderRequest.getBuyOrders().isEmpty()) {
      return Mono.empty();
    }
    var orders =
        confirmOrderRequest.getBuyOrders().stream()
            .map(orderID -> convertToConfirmData(confirmOrderRequest, orderID))
            .toList();

    return api.withAuth()
        .patch()
        .uri(BUY_ORDER_BATCH_API_URL)
        .bodyValue(Map.of("mf_purchases", orders))
        .retrieve()
        .bodyToMono(new ParameterizedTypeReference<>() {});
  }

  public Mono<Void> confirmSIPOrder(ConfirmOrderRequest confirmOrderRequest) {

    if (confirmOrderRequest.getSipOrders() == null
        || confirmOrderRequest.getSipOrders().isEmpty()) {
      return Mono.empty();
    }

    var orders =
        confirmOrderRequest.getSipOrders().stream()
            .map(orderID -> convertToConfirmData(confirmOrderRequest, orderID))
            .toList();

    return api.withAuth()
        .patch()
        .uri(SIP_ORDER_API_URL)
        .bodyValue(Map.of("mf_purchase_plans", orders))
        .retrieve()
        .bodyToMono(new ParameterizedTypeReference<>() {});
  }

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

  public Mono<EntityListResponse<OrderResponse>> placeSIPOrder(List<SipOrderDetail> orders) {
    if (orders.isEmpty()) {
      return Mono.empty();
    }
    return api.withAuth()
        .post()
        .uri(SIP_ORDER_API_URL)
        .bodyValue(Map.of("mf_purchase_plans", orders))
        .retrieve()
        .bodyToMono(new ParameterizedTypeReference<>() {});
  }
}
