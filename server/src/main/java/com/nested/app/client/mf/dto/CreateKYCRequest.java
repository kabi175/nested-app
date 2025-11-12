package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.enums.IncomeSlab;
import jakarta.validation.constraints.NotNull;
import java.util.Map;
import lombok.Data;

@Data
public class CreateKYCRequest {
  private final String country_of_birth = "IN";
  private final String place_of_birth = "IN";
  private final String nationality_country = "in";
  private final String residential_status = "resident_individual";
  @JsonIgnore private boolean isPep = false;
  @NotNull private FATCAUploadRequest.Occupation occupation_type;
  @JsonIgnore private String firstName;
  @JsonIgnore private String lastName;

  @JsonProperty("aadhaar_number")
  private String aadhaarNumber;

  private String email;
  private String father_name;
  private CreateInvestorRequest.Gender gender;
  private String pan;
  @JsonIgnore private String mobileNumber;

  @JsonProperty("income_slab")
  private IncomeSlab incomeSlab;

  @JsonProperty("pep_details")
  public String getPep() {
    return isPep ? "pep_exposed" : "not_applicable";
  }

  @JsonProperty("name")
  public String getName() {
    if (lastName == null) {
      return firstName;
    }
    return firstName + " " + lastName;
  }

  @JsonProperty("mobile")
  public Map<String, String> getMobile() {
    var isd = "91";
    if (mobileNumber.startsWith("+")) {
      mobileNumber = mobileNumber.substring(1);
    }
    if (mobileNumber.length() > 10) {
      isd = mobileNumber.substring(0, mobileNumber.length() - 10);
    }
    return Map.of("isd", isd, "number", mobileNumber);
  }
}
