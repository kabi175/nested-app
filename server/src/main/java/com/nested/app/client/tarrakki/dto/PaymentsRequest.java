package com.nested.app.client.tarrakki.dto;

import java.util.List;
import lombok.Data;

@Data
public class PaymentsRequest {
  private String payment_method;
  private String investor_id;
  private List<PaymentsOrder> orders;
  private String bank_id;
  private String amount;
  private String upi_id;
  private String callback_url;
}
