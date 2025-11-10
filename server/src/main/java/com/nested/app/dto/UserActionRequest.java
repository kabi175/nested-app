package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;

@Builder
public class UserActionRequest {
  private String id;
  private String type;

  @JsonProperty("redirect_url")
  private String redirectUrl;
}
