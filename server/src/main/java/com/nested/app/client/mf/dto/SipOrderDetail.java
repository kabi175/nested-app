package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import com.nested.app.utils.FormatterUtil;
import java.time.LocalDate;
import java.util.Map;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class SipOrderDetail extends OrderDetail {
  @Builder.Default private boolean systematic = true;
  @Builder.Default private String number_of_installments = "30";
  @Builder.Default private String payment_method = "mandate";
  @Builder.Default private boolean auto_generate_installments = true;

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

  @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
  private OrderState state;

  @JsonProperty("consent")
  private Map<String, String> getConsent() {
    var map = FormatterUtil.formatMobileNumberForConsent(mobile);
    if (email != null && !email.isBlank()) {
      map.put("email", email);
    }
    return map;
  }

  @RequiredArgsConstructor
  public enum OrderState {
    CREATED("created"),
    ACTIVE("active"),
    CANCELLED("cancelled"),
    FAILED("failed"),
    COMPLETED("completed");

    @Getter @JsonValue private final String value;
  }
}
