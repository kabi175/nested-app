package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import com.nested.app.entity.Order;
import com.nested.app.entity.SIPOrder;
import com.nested.app.entity.SellOrder;
import java.sql.Timestamp;
import java.time.LocalDate;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Data Transfer Object for Order entity Used for API requests and responses to transfer order data
 *
 * @author Nested App Team
 * @version 1.0
 */
@Data
public class OrderDTO {
  @JsonProperty(access = JsonProperty.Access.READ_ONLY)
  private Long id;

  private Double amount;

  private OrderType type;

  @JsonProperty("yearly_setup")
  private Double yearlySetup;

  @JsonProperty("start_date")
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  private LocalDate startDate;

  @JsonProperty(access = JsonProperty.Access.READ_ONLY)
  private MinifiedGoalDTO goal;

  @JsonProperty(access = JsonProperty.Access.READ_ONLY)
  private Order.OrderStatus status;

  @JsonProperty(value = "updated_at", access = JsonProperty.Access.READ_ONLY)
  private Timestamp createdAt;

  @JsonProperty(value = "updated_at", access = JsonProperty.Access.READ_ONLY)
  private Timestamp updatedAt;

  public static OrderDTO fromEntity(Order order) {

      OrderDTO dto = new OrderDTO();
      dto.setId(order.getId());
      dto.setAmount(order.getAmount());
      dto.setStatus(order.getStatus());
      dto.setCreatedAt(order.getCreatedAt());
      dto.setUpdatedAt(order.getUpdatedAt());

      switch (order) {
          case SIPOrder sipOrder -> {
              dto.setType(OrderDTO.OrderType.SIP);
              dto.setStartDate(sipOrder.getStartDate());
              if(sipOrder.getSipStepUp() != null) {
                  dto.setYearlySetup(sipOrder.getSipStepUp().getStepUpAmount());
              }
          }
          case SellOrder ignored -> dto.setType(OrderDTO.OrderType.SELL);
          default -> dto.setType(OrderDTO.OrderType.BUY);
      }
      return dto;
  }

  @RequiredArgsConstructor
  public enum OrderType {
      BUY("buy"),
      SELL("sell"),
      SIP("sip");

      @Getter @JsonValue
      private final String value;
  }
}
