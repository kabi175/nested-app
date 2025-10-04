package com.nested.app.client.bulkpe.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;

/** DTO for Bulkpe Prefill API response. */
@Data
public class PrefillResponse {

  private boolean status;

  private int statusCode;

  private DataBlock data;

  private String message;

  @Data
  public static class DataBlock {
    private String name;
    private String mobile;

    @JsonProperty("personal_info")
    private PersonalInfo personalInfo;

    @JsonProperty("phone_info")
    private List<PhoneInfo> phoneInfo;

    @JsonProperty("address_info")
    private List<AddressInfo> addressInfo;

    @JsonProperty("email_info")
    private List<EmailInfo> emailInfo;

    @JsonProperty("identity_info")
    private IdentityInfo identityInfo;

    private String reference;
  }

  @Data
  public static class PersonalInfo {
    @JsonProperty("full_name")
    private String fullName;

    private String dob;
    private String gender;

    @JsonProperty("total_income")
    private String totalIncome;

    private String occupation;
    private String age;
  }

  @Data
  public static class PhoneInfo {
    @JsonProperty("reported_date")
    private String reportedDate;

    @JsonProperty("type_code")
    private String typeCode;

    private String number;
  }

  @Data
  public static class AddressInfo {
    private String address;
    private String state;
    private String type;
    private String postal;

    @JsonProperty("reported_date")
    private String reportedDate;
  }

  @Data
  public static class EmailInfo {
    @JsonProperty("reported_date")
    private String reportedDate;

    @JsonProperty("email_address")
    private String emailAddress;
  }

  @Data
  public static class IdentityInfo {
    @JsonProperty("pan_number")
    private List<IdDocument> panNumber;

    @JsonProperty("passport_number")
    private List<IdDocument> passportNumber;

    @JsonProperty("driving_license")
    private List<IdDocument> drivingLicense;

    @JsonProperty("voter_id")
    private List<IdDocument> voterId;

    @JsonProperty("aadhaar_number")
    private List<IdDocument> aadhaarNumber;

    @JsonProperty("ration_card")
    private List<IdDocument> rationCard;

    @JsonProperty("other_id")
    private List<IdDocument> otherId;
  }

  @Data
  public static class IdDocument {
    @JsonProperty("id_number")
    private String idNumber;
  }
}
