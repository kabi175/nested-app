package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.validation.constraints.NotNull;
import java.util.Map;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Builder
public class FATCAUploadRequest {
  private final String country_of_birth = "IN";
  private final String place_of_birth = "IN";

  @JsonProperty("id")
  private String investorID;

  @NotNull private Occupation occupation;

  @NotNull private String pan;

  @JsonProperty("source_of_wealth")
  @NotNull
  private IncomeSource incomeSource;

  @JsonIgnore @Builder.Default private boolean isPep = false;

  @JsonProperty("first_tax_residency")
  public Map<String, String> getTaxResidency() {
    return Map.of("country", country_of_birth, "taxid_type", "pan", "taxid_number", pan);
  }

  @JsonProperty("pep_details")
  public String getPep() {
    return isPep ? "pep_exposed" : "not_applicable";
  }

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
