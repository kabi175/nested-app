package com.nested.app.entity;

import com.nested.app.enums.TransactionType;
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
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Investment transaction ledger row capturing all executed investment activities. Represents a
 * single immutable ledger entry for an investment action (BUY, SIP, SELL, SWP). Each row captures
 * the executed units and price at the time of fulfillment to preserve historical cost basis and
 * enable accurate portfolio aggregation.
 */
@Data
@Entity
@Table(name = "transactions")
@Filter(name = "userFilterByUserId", condition = "user_id = :userId")
public class Transaction {

  /** Auto-generated primary key */
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  /** Owning user of this transaction */
  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id")
  private User user;

  /** Optional goal that this transaction contributes toward */
  @ManyToOne
  @JoinColumn(name = "goal_id")
  private Goal goal;

  /** Fund / scheme in which units were transacted */
  @ManyToOne(optional = false)
  @JoinColumn(name = "fund_id")
  private Fund fund;

  /** Type of transaction (BUY/SIP/SELL/SWP) */
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private TransactionType type;

  /** Signed units: positive for acquisitions (BUY/SIP), negative for disposals (SELL/SWP) */
  @Column(nullable = false)
  private Double units;

  /** Per-unit execution price (NAV) captured at trade time */
  @Column(nullable = false)
  private Double unitPrice;

  /** Absolute monetary value = |units * unitPrice| */
  @Column(nullable = false)
  private Double amount;

  /** External reference (provider order id / payment ref) backing this transaction */
  private String externalRef;

  /** Source order item id (for mapping legacy order items to transactions) */
  private Long sourceOrderItemId;

  /** Actual execution timestamp (can differ from row creation if backfilled) */
  @Column(nullable = false)
  private Timestamp executedAt;

  /** Row creation timestamp */
  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private Timestamp createdAt;

  /** Row last update timestamp (should rarely change) */
  @UpdateTimestamp
  @Column(nullable = false)
  private Timestamp updatedAt;

  /** Provider-side unique transaction identifier (used for idempotency / reconciliation) */
  private String providerTransactionId;
}
