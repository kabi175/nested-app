package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.utils.FormatterUtil;
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

  @JsonInclude(JsonInclude.Include.NON_NULL)
  private String state;

  @JsonProperty("consent")
  private Map<String, String> getConsent() {
    var map = FormatterUtil.formatMobileNumberForConsent(mobile);
    if (email != null && !email.isBlank()) {
      map.put("email", email);
    }
    return map;
  }
}
