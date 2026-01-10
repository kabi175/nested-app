package com.nested.app.entity;

import com.fasterxml.jackson.annotation.JsonValue;
import com.nested.app.dto.PlaceOrderPostDTO;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.sql.Timestamp;
import java.util.List;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Entity representing a payment that can contain multiple orders Handles payment processing,
 * verification, and mandate details
 */
@Data
@Entity
@Table(name = "payments")
@Filter(name = "userFilterByUserId", condition = "user_id = :userId")
public class Payment {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private PaymentStatus buyStatus = PaymentStatus.NOT_AVAILABLE;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private PaymentStatus sipStatus = PaymentStatus.NOT_AVAILABLE;

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

  @Column private Long mandateID;

  @Column private String mandateRef;

  @ManyToOne(fetch = FetchType.EAGER)
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

  @OneToMany(mappedBy = "payment", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
  private List<Order> orders;

  private String orderRef;

  private String ref;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private Timestamp createdAt;

  @UpdateTimestamp
  @Column(nullable = false)
  private Timestamp updatedAt;

  @RequiredArgsConstructor
  public enum PaymentStatus {
    NOT_AVAILABLE("not_available"),
    PENDING("pending"),
    SUBMITTED("submitted"),
    ACTIVE("active"),
    COMPLETED("completed"),
    FAILED("failed"),
    CANCELLED("cancelled");

    @JsonValue @Getter private final String value;
  }

  @RequiredArgsConstructor
  public enum VerificationStatus {
    PENDING("pending"),
    VERIFIED("verified"),
    FAILED("failed");

    @JsonValue @Getter private final String value;
  }
}
