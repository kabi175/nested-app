package com.nested.app.entity;

import jakarta.persistence.*;
import java.sql.Date;
import lombok.Data;

@Data
@Entity
@Table(name = "child")
public class Child {
  @Id private String id;

  @Column(nullable = false)
  private String firstName;

  @Column(nullable = false)
  private String lastName;

  @Column(nullable = false)
  private Date dob;

  @Column(nullable = false)
  private String gender;

  @Column(nullable = false)
  private boolean investUnderChild;

  @Column(nullable = false)
  @JoinColumn(name = "user_id")
  private User user;
}
