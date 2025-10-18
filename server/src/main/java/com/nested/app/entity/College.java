package com.nested.app.entity;

import java.sql.Timestamp;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

/**
 * Entity representing a college or educational institution
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Data
@Entity
@Table(name = "colleges")
public class College {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String name;

  @Column(nullable = false)
  private String location;

  @Column(nullable = false)
  private Double fees;

  @Column(nullable = false)
  private String course;

  @Column(nullable = false)
  private Integer duration;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private CollegeType type;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private Timestamp createdAt;

  @UpdateTimestamp
  @Column(nullable = false)
  private Timestamp updatedAt;

  /**
   * Enum for college types
   */
  public enum CollegeType {
    UNIVERSITY,
    COLLEGE,
    INSTITUTE
  }
}

