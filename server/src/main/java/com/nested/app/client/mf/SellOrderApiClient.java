package com.nested.app.client.mf;

import com.nested.app.client.mf.dto.OrderConsentRequest;
import com.nested.app.client.mf.dto.OrderData;
import com.nested.app.client.mf.dto.SellOrderDetail;
import java.util.List;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public interface SellOrderApiClient {

  Mono<Void> updateConsent(OrderConsentRequest confirmOrderRequest);

  Mono<Void> confirmOrder(List<String> orderIds);

  Mono<SellOrderDetail> placeBuyOrder(SellOrderDetail order);

  Mono<OrderData> fetchOrderDetails(String orderRef);
}
