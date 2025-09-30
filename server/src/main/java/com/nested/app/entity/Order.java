package com.nested.app.entity;

import jakarta.persistence.*;
import java.sql.Date;
import java.sql.Timestamp;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@Entity
@Table(name = "order")
public class Order {
  @Id private String id;

  @Column(nullable = false)
  private Date orderDate;

  @Column(nullable = false)
  private Double amount;

  @Column(nullable = false)
  private String type;

  @Column(nullable = false)
  private String status;

  @ManyToOne
  @JoinColumn(name = "fund_id")
  private Fund fund;

  @Column private Double monthlySip;

  @Column(nullable = false)
  @JoinColumn(name = "user_id")
  private User user;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Timestamp updatedAt;

  @Column private String folio;

  public enum OrderStatus {
        CREATED,
        PLACED,
        COMPLETED,
        FAILED
    }
}
