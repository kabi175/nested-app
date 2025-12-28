package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import java.sql.Timestamp;
import java.util.Date;
import javax.annotation.Nullable;
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

  @Nullable
  @JsonProperty("allotted_units")
  private Double allottedUnits;

  @Nullable
  @JsonProperty("purchased_price")
  private Double purchasedPrice;

  @Nullable
  @JsonProperty("redeemed_units")
  private Double redeemedUnits;

  @Nullable
  @JsonProperty("redeemed_price")
  private Double redeemedPrice;

  @Nullable
  @JsonProperty("redeemed_amount")
  private Double redeemedAmount;

  private OrderState state;

  @JsonProperty("folio_number")
  private String folioRef;

  @Nullable
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  private Date traded_on;

  @Nullable
  @JsonProperty("submitted_at")
  private Timestamp submittedAt;

  @Nullable
  @JsonProperty("succeeded_at")
  private Timestamp succeededAt;

  @Nullable
  @JsonProperty("failed_at")
  private Timestamp failedAt;

  @Nullable
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
