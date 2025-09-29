package com.nested.app.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import java.sql.Timestamp;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@Entity
@Table(name = "users")
@FilterDef(name = "userFilter", parameters = @ParamDef(name = "userId", type = Long.class))
@Filter(name = "userFilter", condition = "id = :userId")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

  private String name;

    @Email(message = "Invalid email format")
    private String email;

  // we are supporting phone number update
  @Column(unique = true, nullable = false, updatable = false)
  private String phoneNumber;

  @Column(unique = true, nullable = false, updatable = false)
  private String firebaseUid;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Timestamp createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private Timestamp updatedAt;

  // admin only has write access
  @Column(nullable = false)
  private boolean isActive = true;

  // admin only has write access
  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Role role = Role.STANDARD;

    public static enum Role {
    STANDARD,
    ADMIN
  }
}
