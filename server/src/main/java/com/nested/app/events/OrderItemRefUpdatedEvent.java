package com.nested.app.events;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event published when an OrderItem's ref field is updated. This typically happens after placing an
 * order with the MF provider.
 *
 * @author Nested App Team
 * @version 1.0
 */
@Getter
public class OrderItemRefUpdatedEvent extends ApplicationEvent {
  private final Long orderId;
  private final String ref;
  private final Long orderItemId;

  public OrderItemRefUpdatedEvent(Object source, Long orderId, String ref, Long orderItemId) {
    super(source);
    this.orderId = orderId;
    this.ref = ref;
    this.orderItemId = orderItemId;
  }
}
