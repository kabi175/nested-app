package com.nested.app.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "funds")
public class Fund {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String label;

    private String description;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String nav;

    @Column(nullable = false)
    private Double mimPurchaseAmount;

    private Double maxPurchaseAmount;

    @Column(nullable = false)
    private Double mimAdditionalPurchaseAmount;

    @Column(nullable = false)
    private Double maxAdditionalPurchaseAmount;

    private boolean isActive = false;

    @Column(nullable = false, unique = true)
    private String isinCode;

    private String schemeCode;

    private String amcCode;

    private String schemeType;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}
