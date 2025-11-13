package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.enums.IncomeSlab;
import jakarta.validation.constraints.NotNull;
import java.util.Map;
import lombok.Data;

@Data
public abstract class BaseKYCRequest {
  protected final String country_of_birth = "IN";
  protected final String place_of_birth = "IN";

  @JsonIgnore protected String firstName;
  @JsonIgnore protected String lastName;

  @JsonProperty("gender")
  protected Gender gender;

  @JsonProperty("pan")
  protected String pan;

  @JsonProperty("email")
  protected String email;

  @JsonIgnore protected String mobileNumber;

  @JsonProperty("father_name")
  protected String fatherName;

  @JsonIgnore @NotNull protected FATCAUploadRequest.Occupation occupation;

  @JsonProperty("income_slab")
  protected IncomeSlab incomeSlab;

  protected String signature;

  @JsonIgnore protected boolean isPep = false;

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
    if (mobileNumber != null && !mobileNumber.isEmpty()) {
      if (mobileNumber.startsWith("+")) {
        mobileNumber = mobileNumber.substring(1);
      }
      if (mobileNumber.length() > 10) {
        isd = mobileNumber.substring(0, mobileNumber.length() - 10);
      }
    }
    return Map.of("isd", isd, "number", mobileNumber != null ? mobileNumber : "");
  }
}
