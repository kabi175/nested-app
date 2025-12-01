package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Data;

@Data
public class SellOrderRequestDTO {

  @Valid
  @NotNull(message = "Sell order items are required")
  @JsonProperty("sell_orders")
  private List<SellOrderItemDTO> sellOrders;

  @Data
  public static class SellOrderItemDTO {
    @NotNull(message = "Goal is required")
    private MinifiedGoalDTO goal;

    @NotNull(message = "Fund ID is required")
    @JsonProperty("fund_id")
    private Long fundId;

    @JsonProperty("amount")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private Double amount;

    @JsonProperty("units")
    @DecimalMin(value = "0.01", message = "Units must be greater than 0")
    private Double units;

    @JsonProperty("reason")
    private String reason;
  }
}
