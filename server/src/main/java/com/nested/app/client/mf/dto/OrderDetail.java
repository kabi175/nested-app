package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
public class OrderDetail {
  @Builder.Default @NotNull protected OrderType order_type = OrderType.BUY;

  @JsonProperty("fund_id")
  @NotNull
  protected String fundID;

  protected String folio;
  @NotNull protected double amount;

  @AllArgsConstructor
  public enum OrderType {
    SIP("sip"),
    BUY("buy"),
    SELL("sell");

    @Getter @JsonValue private final String value;
  }
}
