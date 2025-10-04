package com.nested.app.entity;

import java.sql.Date;
import java.sql.Timestamp;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

/**
 * Entity representing an investment order
 */
@Data
@Entity
@Table(name = "orders")
public class Order {
  
  @Id 
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private Date orderDate;

  @Column(nullable = false)
  private Double amount;

  @Column(nullable = false)
  private String type;

  @Column(nullable = false)
  private String status;

  @ManyToOne
  @JoinColumn(name = "fund_id")
  private Fund fund;

  @Column 
  private Double monthlySip;

  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id")
  private User user;

  @ManyToOne
  @JoinColumn(name = "goal_id")
  private Goal goal;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private Timestamp createdAt;

  @UpdateTimestamp
  @Column(nullable = false)
  private Timestamp updatedAt;

  @Column 
  private String folio;

  public enum OrderStatus {
        CREATED,
        PLACED,
        COMPLETED,
        FAILED
    }
}
