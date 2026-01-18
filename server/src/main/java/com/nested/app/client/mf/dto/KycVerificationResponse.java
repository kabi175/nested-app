package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Data
public class KycVerificationResponse {

  private RequestStatus status;

  private VerificationObject readiness;
  private VerificationObject name;
  private VerificationObject pan;

  @JsonProperty("date_of_birth")
  private VerificationObject dob;

  @RequiredArgsConstructor
  public enum RequestStatus {
    ACCEPTED("accepted"),
    COMPLETED("completed");

    @Getter @JsonValue private final String value;
  }

  @RequiredArgsConstructor
  public enum VerificationStatus {
    VERIFIED("verified"),
    FAILED("failed");

    @Getter @JsonValue private final String value;
  }

  public static class VerificationObject {
    public VerificationStatus status;
    public com.nested.app.enums.VerificationCode code;
    public String reason;
  }
}
