package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import java.sql.Timestamp;
import java.util.Date;
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

  @JsonProperty("redeemed_units")
  private Double redeemedUnits;

  @JsonProperty("redeemed_price")
  private Double redeemedPrice;

  @JsonProperty("redeemed_amount")
  private Double redeemedAmount;

  private OrderState state;

  @JsonProperty("folio_number")
  private String folioRef;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  private Date traded_on;

  @JsonProperty("submitted_at")
  private Timestamp submittedAt;

  @JsonProperty("succeeded_at")
  private Timestamp succeededAt;

  @JsonProperty("failed_at")
  private Timestamp failedAt;

  @JsonProperty("reversed_at")
  private Timestamp reversedAt;

  @JsonProperty("scheme")
  private String fundId;

  @RequiredArgsConstructor
  public enum OrderState {
    CREATED("created"),
    PENDING("pending"),
    UNDER_REVIEW("under_review"),
    CONFIRMED("confirmed"),
    SUBMITTED("submitted"),
    SUCCESSFUL("successful"),
    FAILED("failed"),
    CANCELLED("cancelled"),
    REVERSED("reversed");

    @Getter @JsonValue private final String value;
  }
}
