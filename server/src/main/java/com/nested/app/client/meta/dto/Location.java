package com.nested.app.client.meta.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class Location {
  private String code;
  private String city;
  private String district;

  @JsonProperty("state_name")
  private String stateName;

  @JsonProperty("country_ansi_code")
  private String country;
}
