package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.validation.constraints.NotNull;
import java.util.Map;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = true)
@JsonIgnoreProperties({"email"})
public class CreateInvestorRequest extends BaseKYCRequest {
  private final String tax_status = "resident_individual";

  @JsonProperty("type")
  private InvestorType investorType;

  @JsonProperty("source_of_wealth")
  @NotNull
  private FATCAUploadRequest.IncomeSource incomeSource;

  @JsonProperty("first_tax_residency")
  public Map<String, String> getTaxResidency() {
    return Map.of("country", country_of_birth, "taxid_type", "pan", "taxid_number", pan);
  }

  @JsonProperty("occupation")
  public String getOccupationValue() {
    return getOccupation().getValue();
  }

  @RequiredArgsConstructor
  public enum InvestorType {
    INDIVIDUAL("individual"),
    MINOR("minor");

    @JsonValue @Getter private final String value;
  }
}
