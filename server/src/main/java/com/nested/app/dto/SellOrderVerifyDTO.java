package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Data;

@Data
public class SellOrderVerifyDTO {

  @NotNull(message = "Order IDs are required")
  @NotEmpty(message = "At least one order ID is required")
  @JsonProperty("order_ids")
  private List<Long> orderIds;
}
