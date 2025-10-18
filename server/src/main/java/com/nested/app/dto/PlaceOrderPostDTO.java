package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import com.nested.app.annotation.ValidOrderRequest;
import com.nested.app.entity.SIPOrder;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
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

  @Data
  @ValidOrderRequest
  public static class OrderRequestDTO {
    @NotNull(message = "Goal is required")
    @Valid
    private MinifiedGoalDTO goal;

    @Valid private BuyOrderDTO buyOrder;

    @Valid private SipOrderDTO sipOrder;
  }

  @Data
  public static class BuyOrderDTO {
    @NotNull(message = "Amount is required for buy order")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private Double amount;
  }

  @Data
  public static class SipOrderDTO {
    @NotNull(message = "Amount is required for SIP order")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private Double amount;

    @Valid
    @JsonProperty("setup_option")
    private SetupOptionDTO setupOption;

    @Data
    public static class SetupOptionDTO {
      @NotNull(message = "Setup amount is required")
      @DecimalMin(value = "0.01", message = "Setup amount must be greater than 0")
      private Double amount;

      @NotNull(message = "Frequency is required")
      private SIPOrder.SIPStepUp.Frequency frequency;
    }
  }
}
