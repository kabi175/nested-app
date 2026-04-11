package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import com.nested.app.entity.Payment;
import java.sql.Timestamp;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Data Transfer Object for Payment entity Used for API requests and responses to transfer payment
 * data
 *
 * @author Nested App Team
 * @version 1.0
 */
@Data
public class PaymentDTO {

  private Long id;

  @JsonProperty("buy_status")
  private DtoPaymentStatus buyStatus;

  @JsonProperty("buy_submitted_at")
  private Timestamp buySubmittedAt;

  @JsonProperty("sip_status")
  private DtoPaymentStatus sipStatus;

  @JsonProperty("sip_submitted_at")
  private Timestamp sipSubmittedAt;

  @JsonProperty("verification_status")
  private Payment.VerificationStatus verificationStatus;

  @JsonIgnore private String paymentUrl;

  @JsonProperty("mandate_type")
  private MandateType mandateType;

  @JsonProperty("mandate_id")
  @JsonFormat(shape = JsonFormat.Shape.STRING)
  private Long mandateID;

  @JsonProperty("upi_id")
  private String upiId;

  @JsonProperty("confirmation_url")
  private String confirmationUrl;

  @JsonProperty("verification_code")
  private String verificationCode;

  private Long userId;

  @JsonIgnore private List<OrderDTO> orders;

  @JsonProperty("created_at")
  private Timestamp createdAt;

  @JsonProperty("updated_at")
  private Timestamp updatedAt;

  @RequiredArgsConstructor
  public enum DtoPaymentStatus {
    NOT_AVAILABLE("not_available"),
    PENDING("pending"),
    SUBMITTED("submitted"),
    ACTIVE("active"),
    COMPLETED("completed"),
    FAILED("failed"),
    CANCELLED("cancelled"),
    EXPIRED("expired");  // derived only — never persisted

    @JsonValue @Getter private final String value;
  }

  @AllArgsConstructor
  public enum MandateType {
    NET_BANKING("enach"),
    UPI("upi");

    @JsonValue @Getter private final String value;
  }
}
