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

@Entity
@Table(name = "bank_details")
@Data
public class BankDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
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

  // this is the reference id returned by the tarrakki when the bank is added
  @Column(nullable = false, unique = true, updatable = false)
  private String refId;

  @ManyToOne(optional = false)
  @JoinColumn(name = "investor_id", nullable = false)
  private Investor investor;

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
