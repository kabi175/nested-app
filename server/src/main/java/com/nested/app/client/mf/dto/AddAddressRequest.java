package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Builder
@Data
public class AddAddressRequest {
  @JsonProperty("profile")
  private String investorID;

  @JsonProperty("line1")
  private String addressLine1;

  @JsonProperty("line2")
  private String addressLine2;

  @JsonProperty("line3")
  private String addressLine3;

  private String city;
  private String state;
  private String country;

  @JsonProperty("postal_code")
  private String pincode;

  @Builder.Default private Nature nature = Nature.Residential;

  @RequiredArgsConstructor
  public enum Nature {
    Residential("residential"),
    Business("business_location");

    @JsonValue @Getter private final String value;
  }
}
