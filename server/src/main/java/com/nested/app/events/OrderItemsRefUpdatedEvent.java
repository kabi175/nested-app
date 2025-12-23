package com.nested.app.events;

import com.nested.app.dto.OrderDTO;
import java.util.List;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Batched event published when multiple OrderItems' ref fields are updated. This is more efficient
 * than publishing individual events for each order item.
 *
 * @author Nested App Team
 * @version 1.0
 */
@Getter
public class OrderItemsRefUpdatedEvent extends ApplicationEvent {

  private final List<OrderItemRefInfo> orderItems;
  private final Long paymentId;

  public OrderItemsRefUpdatedEvent(
      Object source, List<OrderItemRefInfo> orderItems, Long paymentId) {
    super(source);
    this.orderItems = orderItems;
    this.paymentId = paymentId;
  }

  /** Information about a single order item ref update */
  public record OrderItemRefInfo(
      Long orderId, String ref, Long orderItemId, OrderDTO.OrderType orderType) {}
}
