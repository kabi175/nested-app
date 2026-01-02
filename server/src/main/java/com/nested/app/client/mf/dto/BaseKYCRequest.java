package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.enums.IncomeSlab;
import jakarta.validation.constraints.NotNull;
import java.util.Date;
import lombok.Data;

@Data
public abstract class BaseKYCRequest {
  @JsonProperty("country_of_birth")
  protected final String countryOfBirth = "IN";

  @JsonProperty("place_of_birth")
  protected final String placeOfBirth = "IN";

  @JsonIgnore protected String firstName;
  @JsonIgnore protected String lastName;

  @JsonProperty("date_of_birth")
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  protected Date dateOfBirth;

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
}
