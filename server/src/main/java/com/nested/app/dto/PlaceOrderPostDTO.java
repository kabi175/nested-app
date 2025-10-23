package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Data;

/**
 * Data Transfer Object for placing orders Used for the place_order API endpoint
 *
 * @author Nested App Team
 * @version 1.0
 */
@Data
public class PlaceOrderPostDTO {

  @NotEmpty(message = "Orders list cannot be empty")
  @Valid
  private List<OrderRequestDTO> orders;

  @NotNull(message = "Payment method is required")
  @JsonProperty("payment_method")
  private PaymentMethod paymentMethod;

  @JsonProperty("bank_id")
  private Long bankID;

  @JsonProperty("upi_id")
  private String upiID;

  public enum PaymentMethod {
    NET_BANKING("net_banking"),
    UPI("upi");

    private final String value;

    PaymentMethod(String value) {
      this.value = value;
    }

    @JsonValue
    public String getValue() {
      return value;
    }
  }

}
