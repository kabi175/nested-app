package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserActionRequest {
  private String id;
  private String type;

  @JsonProperty("redirect_url")
  private String redirectUrl;
}
