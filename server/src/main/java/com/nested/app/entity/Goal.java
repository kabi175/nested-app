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

  @Column(nullable = false)
  @JoinColumn(name = "user_id")
  private User user;

  @Column
  @JoinColumn(name = "child_id")
  private Child child;

  @Column(nullable = false)
  private String status;
}
