package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.entity.OrderItems;
import com.nested.app.entity.SIPOrder;
import java.time.LocalDate;
import lombok.Data;

/**
 * Data Transfer Object for OrderItems entity Used for API requests and responses to transfer order
 * items data
 *
 * @author Nested App Team
 * @version 1.0
 */
@Data
public class OrderItemsDTO {
  @JsonProperty(access = JsonProperty.Access.READ_ONLY)
  private Long id;

  @JsonProperty("fund_id")
  private Long fundId;

  @JsonProperty("fund_name")
  private String fundName;

  @JsonProperty("amount")
  private Double amount;

  @JsonProperty("ref")
  private String ref;

  @JsonProperty("payment_ref")
  private Long paymentRef;

  @JsonProperty("units")
  private Double units;

  @JsonProperty("unit_price")
  private Double unitPrice;

  @JsonProperty("order_id")
  private Long orderId;

  @JsonProperty("user_id")
  private Long userId;

  @JsonProperty("processing_state")
  private String processingState;

  @JsonProperty("version")
  private Long version;

  private LocalDate sipDate;

  public static OrderItemsDTO fromEntity(OrderItems orderItems) {
    OrderItemsDTO dto = new OrderItemsDTO();
    dto.setId(orderItems.getId());
    dto.setFundId(orderItems.getFund() != null ? orderItems.getFund().getId() : null);
    dto.setFundName(orderItems.getFund() != null ? orderItems.getFund().getName() : null);
    dto.setAmount(orderItems.getAmount());
    dto.setRef(orderItems.getRef());
    dto.setPaymentRef(orderItems.getPaymentRef());
    dto.setUnits(orderItems.getUnits());
    dto.setUnitPrice(orderItems.getUnitPrice());
    dto.setOrderId(orderItems.getOrder() != null ? orderItems.getOrder().getId() : null);
    dto.setUserId(orderItems.getUser() != null ? orderItems.getUser().getId() : null);
    dto.setProcessingState(
        orderItems.getProcessingState() != null
            ? orderItems.getProcessingState().getValue()
            : null);
    dto.setVersion(orderItems.getVersion());

    if (orderItems.getOrder() != null && orderItems.getOrder() instanceof SIPOrder sipOrder) {
      dto.setSipDate(sipOrder.getStartDate());
    }
    return dto;
  }
}
