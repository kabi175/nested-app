package com.nested.app.entity;

import java.sql.Date;
import java.sql.Timestamp;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Data;

/** Entity representing a child associated with a user */
@Data
@Entity
@Table(name = "children")
@Filter(name = "userFilterByUserId", condition = "user_id = :userId")
public class Child {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String firstName;

  private String lastName;

  @Column(nullable = false)
  private Date dateOfBirth;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private User.Gender gender = User.Gender.MALE;

  @Column(nullable = false)
  private boolean investUnderChild = true;

  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id")
  private User user;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private Timestamp createdAt;

  @UpdateTimestamp
  @Column(nullable = false)
  private Timestamp updatedAt;

  @OneToOne
  @JoinColumn(name = "investor_id")
  private Investor investor;
}
