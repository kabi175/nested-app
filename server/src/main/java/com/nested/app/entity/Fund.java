package com.nested.app.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.sql.Timestamp;

@Data
@Entity
@Table(name = "funds")
public class Fund {

    @Id
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

    private Double maxPurchaseAmount;

    @Column(nullable = false)
    private Double mimAdditionalPurchaseAmount;

    @Column(nullable = false)
    private Double maxAdditionalPurchaseAmount;

    @Column(nullable = false)
    private boolean isActive = false;

    @Column(nullable = false)
    private boolean isAmcActive = false;

    @Column(nullable = false)
    private boolean isPurchaseAllowed = false;

    @Column(nullable = false)
    private boolean isSipAllowed = false;

    @Column(nullable = false)
    private String isinCode;

    @Column(nullable = false, unique = true, updatable = false)
    private String schemeCode;

    @Column(nullable = false)
    private String amcCode;

    private String schemeType;

    private String settlementType;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Timestamp updatedAt;
}
