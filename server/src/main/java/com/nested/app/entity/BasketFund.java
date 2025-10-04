package com.nested.app.entity;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "basket_fund")
public class BasketFund {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Id
  @ManyToOne
  @JoinColumn(name = "basket_id")
  private Basket basket;

  @Id
  @ManyToOne
  @JoinColumn(name = "fund_id")
  private Fund fund;

  @Column(nullable = false)
  private Double allocationPercentage;
}
