package com.nested.app.client.finprimitives;

import com.nested.app.client.mf.SipOrderApiClient;
import com.nested.app.client.mf.dto.ConfirmOrderRequest;
import com.nested.app.client.mf.dto.OrderData;
import com.nested.app.client.mf.dto.SipOrderDetail;
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
public class SipOrderApiClientImpl implements SipOrderApiClient {
  private static final String SIP_ORDER_API_URL = "/v2/mf_purchase_plans/batch";
  private final FinPrimitivesAPI api;

  @Override
  public Mono<EntityListResponse<OrderData>> placeSipOrder(List<SipOrderDetail> orders) {
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

  @Override
  public Mono<Void> confirmSipOrder(ConfirmOrderRequest confirmOrderRequest) {
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

  @Override
  public Mono<List<OrderData>> fetchTransactionDetails(String orderRef) {
    // TODO: implement this
    return null;
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
}
