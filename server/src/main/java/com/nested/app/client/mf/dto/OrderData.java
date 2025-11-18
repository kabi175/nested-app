package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Data
public class OrderData {
  @JsonProperty("old_id")
  private Long paymentRef;

  @JsonProperty("id")
  private String ref;

  @JsonProperty("source_ref_id")
  private String sourceRefId;

  @JsonProperty("allotted_units")
  private Double allottedUnits;

  @JsonProperty("purchased_price")
  private Double purchasedPrice;

  private OrderState state;

  @RequiredArgsConstructor
  public enum OrderState {
    PENDING("pending"),
    CONFIRMED("confirmed"),
    SUBMITTED("submitted"),
    SUCCESSFUL("successful"),
    FAILED("failed"),
    CANCELLED("cancelled"),
    REVERSED("reversed");

    @Getter @JsonValue private final String value;
  }
}
