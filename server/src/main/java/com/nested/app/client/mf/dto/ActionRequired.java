package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ActionRequired {
  private String id;

  private String type;

  @JsonProperty("redirect_url")
  private String redirectUrl;
}
