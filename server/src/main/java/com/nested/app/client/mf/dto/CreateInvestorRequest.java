package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import java.time.LocalDate;
import java.util.Map;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Data
public class CreateInvestorRequest {
  @JsonProperty("type")
  private InvestorType investor_type;

  @JsonIgnore private String first_name;
  @JsonIgnore private String last_name;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  @JsonProperty("date_of_birth")
  private LocalDate dob;

  private Gender gender;
  private String pan;

  private String email;
  @JsonIgnore private String mobileNumber;
  private String father_name;

  private AddressDTO address;
  private String email_declaration;
  private String mobile_declaration;
  private FatcaDetailDTO fatca_detail;

  @JsonProperty("name")
  public String getName() {
    return first_name + " " + last_name;
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

  @Data
  public static class FatcaDetailDTO {
    private String occupation;
    private String income_source;
    private String income_slab;
    private String birth_place;
    private String birth_country;
  }

  @Data
  public static class AddressDTO {
    private String address_line_1;
    private String address_line_2;
    private String address_line_3;
    private String city;
    private String state;
    private String country;
    private String pincode;
  }
}
