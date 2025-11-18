package com.nested.app.client.mf;

import com.nested.app.client.finprimitives.EntityListResponse;
import com.nested.app.client.mf.dto.ConfirmOrderRequest;
import com.nested.app.client.mf.dto.OrderData;
import com.nested.app.client.mf.dto.SipOrderDetail;
import java.util.List;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public interface SipOrderApiClient {
  Mono<EntityListResponse<OrderData>> placeSipOrder(List<SipOrderDetail> orders);

  Mono<Void> confirmSipOrder(ConfirmOrderRequest confirmOrderRequest);
}
