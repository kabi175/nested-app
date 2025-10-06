package com.nested.app.entity;

import com.fasterxml.jackson.annotation.JsonValue;
import com.nested.app.dto.PlaceOrderPostDTO;
import jakarta.persistence.*;
import java.sql.Timestamp;
import java.util.List;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Entity representing a payment that can contain multiple orders Handles payment processing,
 * verification, and mandate details
 */
@Data
@Entity
@Table(name = "payments")
public class Payment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private PaymentStatus status = PaymentStatus.PENDING;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private VerificationStatus verificationStatus = VerificationStatus.PENDING;

  @Column private String paymentUrl;

  @Column private String verificationRef;

  @Column
  @Enumerated(EnumType.STRING)
  private PlaceOrderPostDTO.PaymentMethod paymentType;

  @Column private String upiId;

  @Column private String mandateConfirmationUrl;

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  @JoinColumn(name = "bank_id")
  private BankDetail bank;

  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id")
  private User user;

  @ManyToOne(fetch = FetchType.EAGER)
  @JoinColumn(name = "child_id")
  private Child child;

  @ManyToOne(optional = false, fetch = FetchType.EAGER)
  @JoinColumn(name = "investor_id")
  private Investor investor;

  @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<Order> orders;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private Timestamp createdAt;

  @UpdateTimestamp
  @Column(nullable = false)
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

    @JsonValue
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

    @JsonValue
    public String getValue() {
      return value;
    }
  }
}
