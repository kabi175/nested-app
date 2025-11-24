package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.HashMap;
import java.util.Map;
import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class OrderConsentRequest {
  @JsonProperty("id")
  private String orderRef;

  @JsonIgnore private String email;

  @JsonIgnore private String mobile;

  @JsonProperty("consent")
  private Map<String, String> getConsent() {
    var map = new HashMap<String, String>();
    if (email != null && !email.isBlank()) {
      map.put("email", email);
    }
    // TODO: handle conversion for mobile

    return map;
  }
}
