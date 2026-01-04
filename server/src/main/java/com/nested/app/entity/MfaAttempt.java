package com.nested.app.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.sql.Timestamp;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Data
@Entity
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Table(
    name = "mfa_attempts",
    indexes = {
      @Index(name = "idx_mfa_attempts_session_id", columnList = "mfa_session_id"),
      @Index(name = "idx_mfa_attempts_attempted_at", columnList = "attempted_at")
    })
public class MfaAttempt {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "mfa_session_id", nullable = false)
  private MfaSession mfaSession;

  @CreationTimestamp
  @Column(name = "attempted_at", nullable = false, updatable = false)
  private Timestamp attemptedAt;

  @Column(name = "success", nullable = false)
  private Boolean success;

  @Column(name = "ip_address")
  private String ipAddress;

  @Column(name = "user_agent", columnDefinition = "TEXT")
  private String userAgent;
}
