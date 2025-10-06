package com.nested.app.client.tarrakki.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Data;

@Data
public class BulkOrderRequest {
  @NotNull @NotEmpty private String investor_id;

  private String authenticator = "tarrakki";
  @NotNull @NotEmpty private String auth_ref;

  @NotNull
  @Size(min = 1)
  private List<OrderDetail> detail;

  @Data
  public static class OrderDetail {
    private String order_type;
    private String fund_id;
    private String folio;
    private double amount;
  }
}
