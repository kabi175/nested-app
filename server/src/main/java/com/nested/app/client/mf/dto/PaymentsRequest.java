package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;

@Data
@Valid
@Builder
public class PaymentsRequest {
  @NotNull
  @JsonProperty("method")
  private PaymentMethod paymentMethod;

  @NotNull
  @Size(min = 1, max = 50)
  @JsonIgnore
  private List<PaymentsOrder> orders;

  @NotNull
  @JsonProperty("bank_account_id")
  private String bankId;

  @JsonProperty("payment_postback_url")
  @JsonInclude(JsonInclude.Include.NON_NULL)
  private String callback_url;

  @JsonProperty("amc_order_ids")
  public List<Long> orderId() {
    return orders.stream().map(PaymentsOrder::getOrderId).toList();
  }

  @AllArgsConstructor
  public enum PaymentMethod {
    NET_BANKING("NETBANKING"),
    UPI("UPI");

    @Getter @JsonValue private final String value;
  }
}
