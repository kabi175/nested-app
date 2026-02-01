package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@RequiredArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
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
  PaymentType paymentType = PaymentType.E_MANDATE;

  @JsonProperty("bank_account_id")
  String bankAccount;

  @Builder.Default
  @JsonProperty("provider_name")
  String provider = "CYBRILLAPOA";

  @JsonProperty("valid_from")
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  LocalDate startDate;

  @JsonProperty("valid_to")
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  LocalDate endDate;

  @RequiredArgsConstructor
  public enum PaymentType {
    E_MANDATE("E_MANDATE"),
    UPI("UPI");

    @Getter @JsonValue private final String value;
  }

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
