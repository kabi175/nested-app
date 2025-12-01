package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.entity.Payment;
import java.util.List;
import lombok.Data;

/**
 * Data Transfer Object for placed order response Used for the place_order and verify_order API
 * responses Now represents a Payment with multiple orders
 *
 * @author Nested App Team
 * @version 1.0
 */
@Data
public class PlaceOrderDTO {

  private Long id;

  @JsonProperty("verification_status")
  private Payment.VerificationStatus verificationStatus;

  @JsonProperty("buy_status")
  private Payment.PaymentStatus buyStatus;

  @JsonProperty("sip_status")
  private Payment.PaymentStatus sipStaus;

  @JsonIgnore private String paymentUrl;

  private MandateDTO mandate;

  @JsonProperty("payment_method")
  private PlaceOrderPostDTO.PaymentMethod paymentMethod;

  private List<OrderDTO> orders;

  @Data
  public static class MandateDTO {

    @JsonProperty("upi_id")
    private String upiId;

    @JsonProperty("confirmation_url")
    private String confirmationUrl;
  }
}
