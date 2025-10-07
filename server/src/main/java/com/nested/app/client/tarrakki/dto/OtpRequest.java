package com.nested.app.client.tarrakki.dto;

import com.fasterxml.jackson.annotation.JsonValue;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OtpRequest {
  private Type otp_type;
  private String investor_id;

  public enum Type {
    BULK_ORDERS("bulk_order"),
    BUY_ORDER("buy_order"),
    SELL_ORDER("sell_order"),
    SIP_ORDER("sip_order"),
    NOMINEE("nominee"),
    ;

    private final String value;

    Type(String value) {
      this.value = value;
    }

    @JsonValue
    public String getValue() {
      return value;
    }
  }
}
