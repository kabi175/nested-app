package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import java.util.Date;
import java.util.Map;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Data
public class CreateInvestorRequest {
  @JsonProperty("type")
  private InvestorType investor_type;

  @JsonIgnore private String firstName;
  @JsonIgnore private String lastName;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  @JsonProperty("date_of_birth")
  private Date dob;

  private Gender gender;
  private String pan;

  private String email;
  @JsonIgnore private String mobileNumber;
  private String father_name;

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

  @RequiredArgsConstructor
  public enum InvestorType {
    INDIVIDUAL("individual"),
    MINOR("minor");

    @JsonValue @Getter private final String value;
  }

  public enum Gender {
    MALE,
    FEMALE,
    TRANSGENDER;

    @JsonValue
    String getValue() {
      return this.name().toLowerCase();
    }
  }
}
