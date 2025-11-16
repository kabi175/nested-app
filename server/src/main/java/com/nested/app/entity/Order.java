package com.nested.app.entity;

import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.sql.Timestamp;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.UpdateTimestamp;

/** Entity representing an investment order */
@Data
@Entity
@Table(name = "orders")
@Filter(name = "userFilterByUserId", condition = "user_id = :userId")
public class Order {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Double amount;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private OrderStatus status = OrderStatus.NOT_PLACED;

  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id")
  private User user;

  @ManyToOne
  @JoinColumn(name = "goal_id")
  private Goal goal;

  @ManyToOne
  @JoinColumn(name = "payment_id")
  private Payment payment;

  private String uuid;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private Timestamp createdAt;

  @UpdateTimestamp
  @Column(nullable = false)
  private Timestamp updatedAt;

  @ManyToOne
  @JoinColumn(name = "investor_id")
  private Investor investor;

  @Column private String folio;

  private String ref;
  private Long paymentRef;

  @PrePersist
  public void generateUUID() {
    if (uuid == null) {
      uuid = java.util.UUID.randomUUID().toString();
    }
  }

  @RequiredArgsConstructor
  public enum OrderStatus {
    NOT_PLACED("not_placed"),
    PLACED("placed"),
    COMPLETED("completed"),
    FAILED("failed"),
    CANCELLED("cancelled");

    @JsonValue @Getter private final String value;
  }
}
