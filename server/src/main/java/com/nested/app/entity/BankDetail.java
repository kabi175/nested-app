package com.nested.app.entity;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "bank_details")
public class BankDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String bankName;

    @Column(nullable = false)
    private String accountNumber;

    @Column(nullable = false)
    private AccountType accountType;

    @Column(nullable = false)
    private String ifscCode;

    @Column(nullable = false)
    private boolean isPrimary;

    @ManyToOne
    @JoinColumn(nullable=false)
    private Client client;

    // Only SAVINGS & CURRENT  is currently supported
    public static enum AccountType {
        SAVINGS,
        CURRENT,
    }
}
