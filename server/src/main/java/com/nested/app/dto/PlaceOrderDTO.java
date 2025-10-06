package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
  private PaymentDTO.VerificationStatus verificationStatus;

  private PaymentDTO.PaymentStatus status;

  @JsonProperty("payment_url")
  private String paymentUrl;

  private MandateDTO mandate;
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
