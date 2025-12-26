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

  @JsonIgnore private String address;

  @JsonProperty("guardian_name")
  private String guardianName;

  @JsonProperty("guardian_email_address")
  private String guardianEmail;

  @JsonProperty("guardian_pan")
  private String guardianPan;

  @JsonProperty("guardian_address")
  private String guardianAddress;

  @JsonIgnore private int allocation;

  @JsonProperty("phone_number")
  public Map<String, Object> phone_number() {
    return Map.of("isd", "+91", "number", "9092390923");
  }

  @JsonProperty("address")
  public Map<String, Object> address() {
    return Map.of(
        "line1",
        "213, 1st cross, JP Nagar",
        "city",
        "Bengaluru",
        "state",
        "Karnataka",
        "postal_code",
        "560102",
        "country",
        "in");
  }

  public static int calculateAge(Date dateOfBirth) {
    // Convert java.util.Date to java.time.LocalDate
    // Assumes the system default time zone for the conversion
    LocalDate birthDate = dateOfBirth.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();

    LocalDate currentDate = LocalDate.now();

    // Calculate the period between the dates
    Period period = Period.between(birthDate, currentDate);

    return period.getYears();
  }

  private boolean isMinor() {
    return calculateAge(dob) < 18;
  }
}
