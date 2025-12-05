package com.nested.app.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.sql.Timestamp;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@Entity
@Table(name = "funds")
public class Fund {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String label;

  private String description;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private Double nav = 0.0;

  @Column(nullable = false)
  private Timestamp navDate = new Timestamp(System.currentTimeMillis());

  @Column(nullable = false)
  private Double mimPurchaseAmount = 0.0;

  @Column(nullable = false)
  private Double minSipAmount = 0.0;

  @Column(nullable = false)
  private boolean isActive = false;

  private String isinCode;

  private String amcCode;

  private String schemeType;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private Timestamp createdAt;

  @UpdateTimestamp
  @Column(nullable = false)
  private Timestamp updatedAt;
}
