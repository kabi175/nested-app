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
import lombok.Data;

@Data
@Entity
@Table(name = "sip_modification_items")
public class SipModificationItem {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false)
  @JoinColumn(name = "modification_id")
  private SipModification modification;

  @ManyToOne(optional = false)
  @JoinColumn(name = "order_item_id")
  private OrderItems orderItem;

  @Column(nullable = false)
  private double oldAmount;

  @Column(nullable = false)
  private double newAmount;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Status status = Status.PENDING;

  public enum Status {
    /** Batch PATCH sent; waiting for plan to reach review_completed. */
    PENDING,
    /** Confirm sent; waiting for plan to reach active. */
    CONFIRMING,
    /** Plan is active; amount applied. */
    COMPLETED,
    /** FP rejected or cancelled this plan. */
    FAILED
  }
}
