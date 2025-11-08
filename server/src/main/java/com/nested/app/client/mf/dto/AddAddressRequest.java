package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

public class AddAddressRequest {
  @JsonProperty("profile")
  private String investorID;

  @JsonProperty("line1")
  private String address_line_1;

  @JsonProperty("line2")
  private String address_line_2;

  @JsonProperty("line3")
  private String address_line_3;

  private String city;
  private String state;
  private String country;

  @JsonProperty("postal_code")
  private String pincode;

  @RequiredArgsConstructor
  public enum Nature {
    Residential("residential"),
    Business("business_location");

    @JsonValue @Getter private final String value;
  }
}
