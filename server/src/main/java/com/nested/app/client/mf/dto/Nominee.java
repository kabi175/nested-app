package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.enums.RelationshipType;
import java.time.LocalDate;
import java.time.Period;
import java.time.ZoneId;
import java.util.Date;
import java.util.Map;
import lombok.Data;
import org.jspecify.annotations.NonNull;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Nominee {
  private String id;

  @JsonProperty("profile")
  private String investorID;

  private String name;

  private RelationshipType relationship;

  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  @JsonProperty("date_of_birth")
  private Date dob;

  private String pan;

  @JsonProperty("email_address")
  private String email;

  private Address address;

  @JsonProperty("guardian_name")
  private String guardianName;

  @JsonProperty("guardian_email_address")
  private String guardianEmail;

  @JsonProperty("guardian_pan")
  private String guardianPan;

  @JsonProperty("guardian_address")
  private Address guardianAddress;

  @JsonIgnore private int allocation;

  @JsonIgnore private String mobileNumber;
  @JsonIgnore private String guardianMobileNumber;

  public static int calculateAge(Date dateOfBirth) {
    // Convert java.util.Date to java.time.LocalDate
    // Assumes the system default time zone for the conversion
    LocalDate birthDate = dateOfBirth.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();

    LocalDate currentDate = LocalDate.now();

    // Calculate the period between the dates
    Period period = Period.between(birthDate, currentDate);

    return period.getYears();
  }

  @JsonProperty("phone_number")
  public Map<String, Object> phone_number() {
    if (mobileNumber == null) {
      return null;
    }
    return getStringObjectMap(mobileNumber);
  }

  @JsonProperty("guardian_phone_number")
  public Map<String, Object> guardian_phone_number() {
    if (guardianMobileNumber == null) {
      return null;
    }
    return getStringObjectMap(guardianMobileNumber);
  }

  private @NonNull Map<String, Object> getStringObjectMap(String mobile) {
    var isd = "91";
    if (mobile.startsWith("+")) {
      mobile = mobile.substring(1);
    }

    if (mobile.length() > 10) {
      isd = mobile.substring(0, mobile.length() - 10);
      mobile = mobile.substring(mobile.length() - 10);
    }

    return Map.of("isd", isd, "number", mobile);
  }

  private boolean isMinor() {
    return calculateAge(dob) < 18;
  }
}
