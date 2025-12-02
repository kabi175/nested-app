package com.nested.app.entity;

import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.Filter;

/**
 * Represents an individual allocation within an Order. Units and unitPrice are populated
 * post-success (after external confirmation). processingState tracks internal enrichment lifecycle.
 */
@Data
@Entity
@Table(name = "order_items")
@Filter(name = "userFilterByUserId", condition = "user_id = :userId")
public class OrderItems {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "fund_id")
  private Fund fund;

  /** Monetary amount allocated to this fund for the parent order */
  private double amount;

  /** Provider reference id once order is placed */
  private String ref;

  /** Provider payment reference */
  private Long paymentRef;

  /** Executed units (set after order success) */
  private Double units;

  /** Execution NAV (price per unit) */
  private Double unitPrice;

  @ManyToOne
  @JoinColumn(name = "order_id")
  private Order order;

  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id")
  private User user;

  @Version private Long version; // optimistic locking to avoid lost updates

  // Optional processing state to represent internal lifecycle
  @Enumerated(EnumType.STRING)
  private ProcessingState processingState = ProcessingState.PENDING;

  @RequiredArgsConstructor
  public enum ProcessingState {
    PENDING("pending"),
    AWAITING_NAV("awaiting_nav"),
    SUCCESS("success"),
    FAILED("failed");

    @JsonValue @Getter private final String value;
  }
}
