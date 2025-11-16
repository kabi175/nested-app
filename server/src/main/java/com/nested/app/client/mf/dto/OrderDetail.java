package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
  @JsonIgnore @Builder.Default @NotNull protected OrderType order_type = OrderType.BUY;

  @JsonProperty("mf_investment_account")
  protected String accountID;

  @JsonProperty("scheme")
  @NotNull
  protected String fundID;

  @JsonIgnore protected String folio;

  @JsonProperty("amount")
  @NotNull
  protected double amount;

  @JsonProperty("user_ip")
  protected String userIP;

  @JsonIgnore protected String sourceRef;

  @AllArgsConstructor
  public enum OrderType {
    SIP("sip"),
    BUY("buy"),
    SELL("sell");

    @Getter @JsonValue private final String value;
  }
}
