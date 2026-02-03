package com.nested.app.client.finprimitives;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nested.app.client.mf.SipOrderApiClient;
import com.nested.app.client.mf.dto.OrderConsentRequest;
import com.nested.app.client.mf.dto.OrderData;
import com.nested.app.client.mf.dto.SipOrderDetail;
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
public class SipOrderApiClientImpl implements SipOrderApiClient {
  private static final String SIP_ORDER_BATCH_API_URL = "/v2/mf_purchase_plans/batch";
  private static final String SIP_ORDER_API_URL = "/v2/mf_purchase_plans";
  private static final String SIP_ORDER_TXN_API_URL = "/v2/mf_purchases";
  private final FinPrimitivesAPI api;
  private final ObjectMapper objectMapper;

  @Override
  public Mono<EntityListResponse<OrderData>> placeSipOrder(List<SipOrderDetail> orders) {
    try {
      log.info("placeSipOrder with orders: {}", objectMapper.writeValueAsString(orders));
    } catch (Exception e) {
      log.warn("Failed to serialize request for logging", e);
    }
    if (orders.isEmpty()) {
      return Mono.empty();
    }
    return api.withAuth()
        .post()
        .uri(SIP_ORDER_BATCH_API_URL)
        .bodyValue(Map.of("mf_purchase_plans", orders))
        .retrieve()
        .bodyToMono(new ParameterizedTypeReference<>() {});
  }

  @Override
  public Mono<Void> updateConsent(OrderConsentRequest request) {
    try {
      log.info("updateConsent with request: {}", objectMapper.writeValueAsString(request));
    } catch (Exception e) {
      log.warn("Failed to serialize request for logging", e);
    }

    return api.withAuth()
        .patch()
        .uri(SIP_ORDER_API_URL)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(Void.class);
  }

  @Override
  public Mono<Void> confirmOrder(List<String> orderIds) {
    var orders =
        orderIds.stream().map(orderID -> Map.of("id", orderID, "state", "confirmed")).toList();
    var request = Map.of("mf_purchase_plans", orders);
    return api.withAuth()
        .patch()
        .uri(SIP_ORDER_BATCH_API_URL)
        .bodyValue(request)
        .retrieve()
        .bodyToMono(Void.class);
  }

  @Override
  public Mono<SipOrderDetail> fetchSipOrderDetail(String orderRef) {
    return api.withAuth()
        .get()
        .uri(uriBuilder -> uriBuilder.path(SIP_ORDER_API_URL + "/" + orderRef).build())
        .retrieve()
        .bodyToMono(SipOrderDetail.class);
  }

  @Override
  public Mono<List<OrderData>> fetchTransactionDetails(String orderRef) {
    if (orderRef == null) {
      return Mono.empty();
    }
    return api.withAuth()
        .get()
        .uri(
            uriBuilder ->
                uriBuilder.path(SIP_ORDER_TXN_API_URL).queryParam("plan", orderRef).build())
        .retrieve()
        .bodyToMono(new ParameterizedTypeReference<EntityListResponse<OrderData>>() {})
        .map(EntityListResponse::getData)
        .onErrorResume(
            ex -> {
              log.warn(
                  "Failed fetching SIP transactions for ref {}: {}", orderRef, ex.getMessage());
              return Mono.empty();
            });
  }
}
