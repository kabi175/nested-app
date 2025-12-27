package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Address {
  @JsonProperty("line1")
  private String addressLine1;

  @JsonProperty("line2")
  private String addressLine2;

  @JsonProperty("line3")
  private String addressLine3;

  private String city;
  private String state;
  private String country = "in";

  @JsonProperty("postal_code")
  private String pinCode;
}
