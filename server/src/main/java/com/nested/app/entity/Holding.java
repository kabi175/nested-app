package com.nested.app.entity;

import java.sql.Timestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Entity representing a holding (investment position)
 */
@Data
@Entity
@Table(name = "holdings")
@Filter(name = "userFilterByUserId", condition = "user_id = :userId")
public class Holding {
  
  @Id 
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Double units;

  @Column(nullable = false)
  private Double investedAmount;

  @Column(nullable = false)
  private Double currentValue;

  @ManyToOne
  @JoinColumn(name = "order_id")
  private Order order;

  @Column(nullable = false)
  private Double orderAllocationPercentage;

  @ManyToOne
  @JoinColumn(name = "goal_id")
  private Goal goal;

  @ManyToOne
  @JoinColumn(name = "fund_id")
  private Fund fund;

  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id")
  private User user;

  @ManyToOne
  @JoinColumn(name = "child_id")
  private Child child;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private Timestamp createdAt;

  @UpdateTimestamp
  @Column(nullable = false)
  private Timestamp updatedAt;
}
