package com.nested.app.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.Filter;

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

  private double amount;

  private String ref;

  private Long paymentRef;

  private Double units;

  private Double unitPrice;

  @ManyToOne
  @JoinColumn(name = "order_id")
  private Order order;

  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id")
  private User user;
}
