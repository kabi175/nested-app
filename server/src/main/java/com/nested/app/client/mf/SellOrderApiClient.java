package com.nested.app.client.mf;

import com.nested.app.client.finprimitives.EntityListResponse;
import com.nested.app.client.mf.dto.OrderData;
import com.nested.app.client.mf.dto.OrderDetail;
import java.util.List;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public interface SellOrderApiClient {
  Mono<EntityListResponse<OrderData>> placeBuyOrder(List<OrderDetail> orders);
}
