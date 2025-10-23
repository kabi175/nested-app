package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.annotation.ValidOrderRequest;
import com.nested.app.entity.SIPOrder;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Data;

@Data
@ValidOrderRequest
public class OrderRequestDTO {

  @Valid
  @JsonProperty("buy_order")
  private List<BuyOrderDTO> buyOrder;

  @Valid
  @JsonProperty("sip_order")
  private List<OrderRequestDTO.SipOrderDTO> sipOrder;

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

      @JsonIgnore
      private SIPOrder.SIPStepUp.Frequency frequency = SIPOrder.SIPStepUp.Frequency.YEARLY;

      public SIPOrder.SIPStepUp toEntity() {
        SIPOrder.SIPStepUp sipStepUp = new SIPOrder.SIPStepUp();
        sipStepUp.setStepUpAmount(this.amount);
        sipStepUp.setStepUpFrequency(this.frequency);
        return sipStepUp;
      }
    }
  }
}
