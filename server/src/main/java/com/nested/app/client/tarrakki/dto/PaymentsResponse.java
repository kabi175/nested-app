package com.nested.app.client.tarrakki.dto;

import lombok.Data;

@Data
public class PaymentsResponse {
  private String payment_id;
  private String redirect_url;
}
