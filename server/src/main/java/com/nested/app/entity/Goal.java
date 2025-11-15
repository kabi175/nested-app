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
import java.sql.Date;
import java.sql.Timestamp;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.UpdateTimestamp;

/** Entity representing an investment goal */
@Data
@Entity
@Table(name = "goals")
@Filter(name = "userFilterByUserId", condition = "user_id = :userId")
public class Goal {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false)
  private Double targetAmount;

  @Column(nullable = false)
  private Double currentAmount = 0.0;

  private Double monthlySip = 0.0;

  @Column(nullable = false)
  private Date targetDate;

  @ManyToOne
  @JoinColumn(name = "basket_id")
  private Basket basket;

  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id")
  private User user;

  @ManyToOne(optional = false, fetch = jakarta.persistence.FetchType.EAGER)
  @JoinColumn(name = "child_id")
  private Child child;

  @ManyToOne(optional = false)
  @JoinColumn(name = "education_id")
  private Education education;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private Status status = Status.DRAFT;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private Timestamp createdAt;

  @UpdateTimestamp
  @Column(nullable = false)
  private Timestamp updatedAt;

  public boolean canInvest() {
    return this.status == Status.ACTIVE || this.status == Status.DRAFT;
  }

  public enum Status {
    DRAFT("draft"),
    PAYMENT_PENDING("payment_pending"),
    ACTIVE("active"),
    COMPLETED("completed"),
    CANCELLED("cancelled");

    private final String value;

    Status(String value) {
      this.value = value;
    }

    @JsonValue
    public String getValue() {
      return value;
    }
  }
}
