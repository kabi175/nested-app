package com.nested.app.client.tarrakki.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class PaymentsResponse {
  @JsonProperty("payment_id")
  private String paymentId;

  @JsonProperty("redirect_url")
  private String redirectUrl;
}
