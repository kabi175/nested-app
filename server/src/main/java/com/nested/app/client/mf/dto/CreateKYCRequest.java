package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class CreateKYCRequest extends BaseKYCRequest {
  private final String nationality_country = "in";
  private final String residential_status = "resident_individual";
  private final boolean tax_residency_other_than_india = false;
  private final List<String> citizenship_countries = List.of("in");

  private Map<String, String> geolocation;

  @JsonProperty("marital_status")
  private String maritalStatus;

  @JsonProperty("aadhaar_number")
  private String aadhaarNumber;

  @JsonProperty("occupation_type")
  public String getOccupationValue() {
    return getOccupation().getValue();
  }
}
