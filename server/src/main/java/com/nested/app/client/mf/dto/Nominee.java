package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.nested.app.enums.RelationshipType;
import com.nested.app.utils.FormatterUtil;
import java.util.Date;
import java.util.Map;
import javax.annotation.Nullable;
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

  @Nullable
  @JsonGetter("phone_number")
  public Map<String, Object> phoneNumber() {
    return FormatterUtil.formatMobileNumber(mobileNumber);
  }

  @JsonSetter("phone_number")
  public void setPhoneNumber(Map<String, Object> phoneNumber) {
    if (phoneNumber != null && phoneNumber.containsKey("number")) {
      mobileNumber = (String) phoneNumber.get("number");
    }
  }

  @Nullable
  @JsonGetter("guardian_phone_number")
  public Map<String, Object> guardianPhoneNumber() {
    return FormatterUtil.formatMobileNumber(guardianMobileNumber);
  }

  @JsonSetter("guardian_phone_number")
  public void setGuardianPhoneNumber(Map<String, Object> phoneNumber) {
    if (phoneNumber != null && phoneNumber.containsKey("number")) {
      guardianMobileNumber = (String) phoneNumber.get("number");
    }
  }
}
