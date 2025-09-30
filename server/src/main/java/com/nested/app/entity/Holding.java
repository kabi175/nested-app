package com.nested.app.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "holding")
public class Holding {
  @Id private String id;

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

  @Column(nullable = false)
  @JoinColumn(name = "user_id")
  private User userId;

  @Column
  @JoinColumn(name = "child_id")
  private Child childId;
}
