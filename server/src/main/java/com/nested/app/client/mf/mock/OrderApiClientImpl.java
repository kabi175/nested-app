package com.nested.app.client.mf.mock;

import static com.nested.app.client.mf.mock.Util.generateMockId;

import com.nested.app.client.mf.OrderApiClient;
import com.nested.app.client.tarrakki.dto.BulkOrderRequest;
import com.nested.app.client.tarrakki.dto.OrderResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import reactor.core.publisher.Mono;

@Slf4j
@Service
@Profile("dev")
public class OrderApiClientImpl implements OrderApiClient {

  @Override
  public Mono<OrderResponse> placeBulkOrder(@Validated BulkOrderRequest request) {
    log.info("Mock placeBulkOrder called with request for investor: {}", request.getInvestor_id());

    request
        .getDetail()
        .forEach(
            order ->
                log.info("Order fund_id: {} amount: {}", order.getFundID(), order.getAmount()));

    var resp = new OrderResponse();
    resp.setBulk_order_id(generateMockId("bulk_order"));
    return Mono.just(resp);
  }
}
