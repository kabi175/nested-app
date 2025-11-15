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
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

@Entity
@Table(name = "bank_details")
@Data
@FilterDef(name = "userFilterByUserId", parameters = @ParamDef(name = "userId", type = Long.class))
@Filter(name = "userFilterByUserId", condition = "user_id = :userId")
public class BankDetail {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column
  private String bankName;

  @Column(nullable = false)
  private String accountNumber;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private AccountType accountType;

  @Column(nullable = false)
  private String ifscCode;

  @Column(nullable = false)
  private boolean isPrimary;

  @Column
  private String refId;

  @ManyToOne()
  @JoinColumn(name = "investor_id")
  private Investor investor;

  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  // Only SAVINGS & CURRENT  is currently supported
  public enum AccountType {
    SAVINGS,
    CURRENT;

    @JsonValue
    public String getValue() {
      return name().toLowerCase();
    }
  }
}
