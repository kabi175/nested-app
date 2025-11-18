package com.nested.app.events;

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
  @Getter
  public static class OrderItemRefInfo {
    private final Long orderId;
    private final String ref;
    private final Long orderItemId;

    public OrderItemRefInfo(Long orderId, String ref, Long orderItemId) {
      this.orderId = orderId;
      this.ref = ref;
      this.orderItemId = orderItemId;
    }
  }
}
