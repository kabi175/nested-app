package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@RequiredArgsConstructor
public class MandateDto {
  @JsonProperty("mandate_ref")
  String ref;

  Long id;

  @JsonProperty("mandate_limit")
  Double amount;

  @JsonProperty("mandate_status")
  State status;

  @Builder.Default
  @JsonProperty("mandate_type")
  String mandateType = "E_MANDATE";

  @JsonProperty("bank_account_id")
  String bankAccount;

  @Builder.Default
  @JsonProperty("provider_name")
  String provider = "CYBRILLAPOA";

  @JsonProperty("valid_from")
  Date startDate;

  @JsonProperty("valid_to")
  Date endDate;

  @RequiredArgsConstructor
  public enum State {
    CREATED("CREATED"),
    RECEIVED("RECEIVED"),
    APPROVED("APPROVED"),
    SUBMITTED("SUBMITTED"),
    REJECTED("REJECTED"),
    CANCELLED("CANCELLED");
    @Getter @JsonValue private final String value;
  }
}
