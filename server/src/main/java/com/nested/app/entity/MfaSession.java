package com.nested.app.entity;

import com.nested.app.enums.MfaChannel;
import com.nested.app.enums.MfaStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.sql.Timestamp;
import java.util.UUID;
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
    name = "mfa_sessions",
    indexes = {
      @Index(name = "idx_mfa_sessions_user_id", columnList = "user_id"),
      @Index(name = "idx_mfa_sessions_status", columnList = "status"),
      @Index(name = "idx_mfa_sessions_created_at", columnList = "created_at"),
      @Index(name = "idx_mfa_sessions_user_id_status", columnList = "user_id, status")
    })
public class MfaSession {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "user_id", nullable = false, length = 64)
  private String userId;

  @Column(name = "action", nullable = false, length = 50)
  private String action;

  @Enumerated(EnumType.STRING)
  @Column(name = "channel", nullable = false, length = 20)
  private MfaChannel channel;

  @Column(name = "destination", length = 64)
  private String destination;

  @Column(name = "otp_hash", nullable = false, length = 64)
  private String otpHash;

  @Column(name = "otp_expires_at", nullable = false)
  private Timestamp otpExpiresAt;

  @Column(name = "max_attempts", nullable = false)
  @Builder.Default
  private Short maxAttempts = 3;

  @Column(name = "attempts", nullable = false)
  @Builder.Default
  private Short attempts = 0;

  @Enumerated(EnumType.STRING)
  @Column(name = "status", nullable = false, length = 20)
  @Builder.Default
  private MfaStatus status = MfaStatus.PENDING;

  @Column(name = "device_id", length = 64)
  private String deviceId;

  @Column(name = "ip_address")
  private String ipAddress;

  @Column(name = "user_agent", columnDefinition = "TEXT")
  private String userAgent;

  @Column(name = "mfa_token", columnDefinition = "TEXT")
  private String mfaToken;

  @Column(name = "mfa_token_expires_at")
  private Timestamp mfaTokenExpiresAt;

  @Column(name = "verified_at")
  private Timestamp verifiedAt;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private Timestamp createdAt;
}
