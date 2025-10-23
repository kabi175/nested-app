package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.entity.Order;
import java.sql.Timestamp;
import lombok.Data;

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

  private String type;

  private Double monthlySip;

  private Double yearlySetup;

  @JsonProperty(access = JsonProperty.Access.READ_ONLY)
  private MinifiedGoalDTO goal;

  @JsonProperty(access = JsonProperty.Access.READ_ONLY)
  private Order.OrderStatus status;

  @JsonProperty(access = JsonProperty.Access.READ_ONLY)
  private Timestamp createdAt;

  @JsonProperty(access = JsonProperty.Access.READ_ONLY)
  private Timestamp updatedAt;
}
