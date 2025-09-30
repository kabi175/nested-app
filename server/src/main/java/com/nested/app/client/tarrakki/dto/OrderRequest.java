package com.nested.app.client.tarrakki.dto;

import java.util.List;
import lombok.Data;

@Data
public class OrderRequest {
  private String investor_id;
  private String authenticator;
  private String auth_ref;
  private String mobile;
  private String email;
  private List<OrderDetail> detail;

  @Data
  public static class OrderDetail {
    private String order_type;
    private String fund_id;
    private String folio;
    private double amount;
  }
}
