package com.nested.app.entity;

import jakarta.persistence.*;
import java.sql.Date;
import java.sql.Timestamp;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/** Entity representing a child associated with a user */
@Data
@Entity
@Table(name = "children")
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
