package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Builder
public class FATCAUploadRequest {

  @JsonProperty("id")
  private String investorID;

  @NotNull private Occupation occupation;

  @NotNull private String pan;



  @RequiredArgsConstructor
  public enum Occupation {
    BUSINESS("business"),
    PROFESSIONAL("professional"),
    RETIRED("retired"),
    HOUSEWIFE("housewife"),
    STUDENT("student"),
    PUBLIC_SECTOR("public_sector_service"),
    PRIVATE_SECTOR("private_sector_service"),
    GOVERNMENT_SERVICE("government_service"),
    AGRICULTURE("agriculture"),
    DOCTOR("doctor"),
    FOREX_DEALER("forex_dealer"),
    OTHERS("others");

    @Getter @JsonValue private final String value;
  }

  @RequiredArgsConstructor
  public enum IncomeSource {
    SALARY("salary"),
    BUSINESS("business"),
    RENTAL_INCOME("rental_income"),
    ROYALTY("royalty"),
    ANCESTRAL_PROPERTY("ancestral_property"),
    PRIZE_MONEY("prize_money"),
    OTHERS("others");

    @JsonValue @Getter private final String value;
  }
}
