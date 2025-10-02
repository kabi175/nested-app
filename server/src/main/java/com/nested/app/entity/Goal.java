package com.nested.app.entity;

import jakarta.persistence.*;
import java.sql.Date;
import lombok.Data;

@Data
@Entity
@Table(name = "goal")
public class Goal {
  @Id private String id;

  @Column(nullable = false)
  private String title;

  @Column(nullable = false)
  private Double targetAmount;

  @Column(nullable = false)
  private Double currentAmount;

  @Column(nullable = false)
  private Date targetDate;

  @ManyToOne
  @JoinColumn(name = "basket_id")
  private Basket basket;

  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id")
  private User user;

  @ManyToOne
  @JoinColumn(name = "child_id")
  private Child child;

  @Column(nullable = false)
  private String status;
}
