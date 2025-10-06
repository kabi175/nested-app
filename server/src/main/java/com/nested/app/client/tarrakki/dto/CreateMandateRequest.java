package com.nested.app.client.tarrakki.dto;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Data;

@Data
public class CreateMandateRequest {
  private String investor_id;
  private String bank_id;
  private Double auto_debit_limit;
  private String callback_url;
  private MandateType mandate_type;
  private String upi_id;

  public enum MandateType {
    ENACH("enach"),
    UPI("upi");

    private final String value;

    MandateType(String value) {
      this.value = value;
    }

    @JsonValue
    public String getValue() {
      return value;
    }
  }
}
