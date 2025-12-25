package com.nested.app.entity;

import com.nested.app.enums.RelationshipType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.Period;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Nominee {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, updatable = false)
  private String name;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, updatable = false)
  private RelationshipType relationship;

  @Column(nullable = false)
  private Date dob;

  private String pan;

  private String email;

  private String address;

  private String guardianName;

  private String guardianEmail;

  private String guardianPan;

  private String guardianAddress;

  // External ref
  private String ref;

  @Column(nullable = false)
  private int allocation;

  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id", updatable = false)
  private User user;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private Timestamp createdAt;

  @UpdateTimestamp
  @Column(nullable = false)
  private Timestamp updatedAt;

  /**
   * Calculates if nominee is minor (less than 18 years old)
   *
   * @return true if nominee is minor, false otherwise
   */
  public boolean isMinor() {
    if (dob == null) {
      return false;
    }
    LocalDate dobLocal = new java.sql.Date(dob.getTime()).toLocalDate();
    LocalDate today = LocalDate.now();
    return Period.between(dobLocal, today).getYears() < 18;
  }
}
