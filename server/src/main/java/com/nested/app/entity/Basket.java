package com.nested.app.entity;

import com.nested.app.enums.BasketType;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.sql.Timestamp;
import java.util.List;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/** Entity representing an investment basket */
@Data
@Entity
@Table(name = "baskets")
public class Basket {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, unique = true)
  private String title;

  private Double returns;

  @OneToMany(mappedBy = "basket", cascade = CascadeType.ALL)
  private List<BasketFund> basketFunds;

  private Double years;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private BasketType basketType;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private Timestamp createdAt;

  @UpdateTimestamp
  @Column(nullable = false)
  private Timestamp updatedAt;

  public Double getMinInvestmentAmount() {
    double goalMinInvestment = 0.0;

    for (var fund : basketFunds) {
      double allocationFraction = fund.getAllocationPercentage() / 100.0;

      var minInvestment = fund.getFund().getMimPurchaseAmount();
      if (minInvestment <= 0) {
        continue;
      }
      double requiredInvestment = minInvestment / allocationFraction;
      goalMinInvestment = Math.max(goalMinInvestment, requiredInvestment);
    }

    return Math.ceil(goalMinInvestment / 100.0) * 100.0;
  }

  public Double getMinSIPAmount() {
    double goalMinSIP = 0.0;

    for (var fund : basketFunds) {
      double allocationFraction = fund.getAllocationPercentage() / 100.0;

      var minSipAmount = fund.getFund().getMinSipAmount();
      if (minSipAmount <= 0) {
        continue;
      }
      double requiredInvestment = minSipAmount / allocationFraction;
      goalMinSIP = Math.max(goalMinSIP, requiredInvestment);
    }

    return Math.ceil(goalMinSIP / 100.0) * 100.0;
  }
}
