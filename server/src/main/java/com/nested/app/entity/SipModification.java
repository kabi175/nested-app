package com.nested.app.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.sql.Timestamp;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

@Data
@Entity
@Table(name = "sip_modifications")
public class SipModification {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "sip_order_id")
  private SIPOrder sipOrder;

  @Column(nullable = false)
  private double requestedAmount;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Status status = Status.PENDING;

  /**
   * FP mandate ID created for this modification when the new amount exceeds the current mandate
   * limit. Null if the existing mandate was sufficient.
   */
  private Long mandateId;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private Timestamp createdAt;

  public enum Status {
    /** New mandate created; waiting for user to authorize in browser. */
    AWAITING_MANDATE,
    /** Batch PATCH submitted to FP; polling for review_completed on all plans. */
    PENDING,
    /** Batch confirm sent; polling for active on all plans. */
    CONFIRMING,
    /** All plans active; OrderItem amounts synced. */
    COMPLETED,
    /** FP rejected one or more plans. */
    FAILED
  }
}
