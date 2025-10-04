package com.nested.app.entity;

import java.sql.Timestamp;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "funds")
public class Fund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment ID
    private Long id;

    @Column(nullable = false)
    private String label;

    private String description;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Double nav;

    @Column(nullable = false)
    private Timestamp navDate;

    @Column(nullable = false)
    private Double mimPurchaseAmount;

    @Column(nullable = false)
    private Double mimAdditionalPurchaseAmount;

    @Column(nullable = false)
    private boolean isActive = false;

    @Column(nullable = false)
    private String isinCode;

    @Column(nullable = false, unique = true, updatable = false)
    private String schemeCode;

    @Column(nullable = false)
    private String amcCode;

    private String schemeType;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Timestamp updatedAt;
}
