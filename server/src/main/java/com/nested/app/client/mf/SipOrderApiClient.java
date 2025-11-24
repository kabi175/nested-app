package com.nested.app.client.mf;

import com.nested.app.client.finprimitives.EntityListResponse;
import com.nested.app.client.mf.dto.OrderConsentRequest;
import com.nested.app.client.mf.dto.OrderData;
import com.nested.app.client.mf.dto.SipOrderDetail;
import java.util.List;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public interface SipOrderApiClient {
  Mono<EntityListResponse<OrderData>> placeSipOrder(List<SipOrderDetail> orders);

  Mono<Void> updateConsent(OrderConsentRequest confirmOrderRequest);

  Mono<Void> confirmOrder(List<String> orderIds);

  // returns 100 latest Transactions
  Mono<List<OrderData>> fetchTransactionDetails(String orderRef);
}
