package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
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
  @NotNull private PaymentMethod payment_method;

  @NotNull private String investor_id;

  @NotNull
  @Size(min = 1, max = 50)
  private List<PaymentsOrder> orders;

  @NotNull private String bank_id;

  @JsonFormat(shape = JsonFormat.Shape.STRING)
  @NotNull
  private Double amount;

  @JsonInclude(JsonInclude.Include.NON_NULL)
  private String upi_id;

  @JsonInclude(JsonInclude.Include.NON_NULL)
  private String callback_url;

  @AllArgsConstructor
  public enum PaymentMethod {
    NET_BANKING("netbanking"),
    UPI("upi");

    @Getter @JsonValue private final String value;
  }
}
