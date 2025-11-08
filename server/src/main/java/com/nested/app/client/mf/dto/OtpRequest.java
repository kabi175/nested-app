package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OtpRequest {

  private Type otp_type;

  private String investor_id;

  @RequiredArgsConstructor
  public enum Type {
    BULK_ORDERS("bulk_order"),
    BUY_ORDER("buy_order"),
    SELL_ORDER("sell_order"),
    SIP_ORDER("sip_order"),
    NOMINEE("nominee");

    @JsonValue @Getter private final String value;

    @JsonCreator
    public static Type fromValue(String value) {
      for (Type type : Type.values()) {
        if (type.value.equals(value)) {
          return type;
        }
      }
      throw new IllegalArgumentException("Unknown value: " + value);
    }
  }
}
