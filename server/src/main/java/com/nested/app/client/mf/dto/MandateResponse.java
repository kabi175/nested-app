package com.nested.app.client.mf.dto;

import lombok.Data;

@Data
public class MandateResponse {
  private String mandate_id;
  private String investor_id;
  private String bank_id;
  private CreateMandateRequest.MandateType mandate_type;
  private String upi_id;
  private String status;
  private String status_remark;
  private String redirection_url;
}
