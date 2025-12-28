package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@EqualsAndHashCode(callSuper = true)
public class SipOrderDetail extends OrderDetail {
  private final boolean systematic = true;
  private final String number_of_installments = "30";
  private final String payment_method = "mandate";

  @JsonProperty("payment_source")
  String mandateID;

  @JsonIgnore LocalDate startDate;

  @JsonProperty("generate_first_installment_now")
  boolean firstOrderToday;

  @Builder.Default String frequency = "monthly";

  @JsonProperty("installment_day")
  private String installmentDay;

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
