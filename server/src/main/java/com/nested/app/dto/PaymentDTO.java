package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.sql.Timestamp;
import java.util.List;
import lombok.Data;

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

  private PaymentStatus status;

  @JsonProperty("verification_status")
  private VerificationStatus verificationStatus;

  @JsonProperty("payment_url")
  private String paymentUrl;

  @JsonProperty("verification_ref")
  private String verificationRef;

  @JsonProperty("mandate_type")
  private MandateType mandateType;

  @JsonProperty("upi_id")
  private String upiId;

  @JsonProperty("confirmation_url")
  private String confirmationUrl;

  @JsonProperty("verification_code")
  private String verificationCode;

  private Long userId;

  private Long childId;

  private List<OrderDTO> orders;

  @JsonProperty("created_at")
  private Timestamp createdAt;

  @JsonProperty("updated_at")
  private Timestamp updatedAt;

  public enum PaymentStatus {
    PENDING("pending"),
    COMPLETED("completed"),
    FAILED("failed"),
    CANCELLED("cancelled");

    private final String value;

    PaymentStatus(String value) {
      this.value = value;
    }

    public String getValue() {
      return value;
    }
  }

  public enum VerificationStatus {
    PENDING("pending"),
    VERIFIED("verified"),
    FAILED("failed");

    private final String value;

    VerificationStatus(String value) {
      this.value = value;
    }

    public String getValue() {
      return value;
    }
  }

  public enum MandateType {
    NET_BANKING("net_banking"),
    UPI("upi");

    private final String value;

    MandateType(String value) {
      this.value = value;
    }

    public String getValue() {
      return value;
    }
  }
}
