package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Map;
import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class CreateAccountRequest {
  @JsonProperty("primary_investor")
  private String investorID;

  @JsonIgnore private String addressRef;
  @JsonIgnore private String emailRef;
  @JsonIgnore private String mobileRef;

  @JsonProperty("folio_defaults")
  public Map<String, String> getDetauls() {
    return Map.of(
        "communication_email_address",
        emailRef,
        "communication_mobile_number",
        mobileRef,
        "communication_address",
        addressRef);
  }
}
