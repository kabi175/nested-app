package com.nested.app.entity;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.client.mf.dto.KycVerificationResponse;
import com.nested.app.enums.VerificationCode;
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
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.ToString;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@Entity
@Builder
@ToString
@NoArgsConstructor(access = AccessLevel.PROTECTED) // required by JPA
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@AllArgsConstructor
public class UserVerification {

  @Id
  @EqualsAndHashCode.Include
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String ref;

  @Enumerated(EnumType.STRING)
  @Builder.Default
  private KycVerificationResponse.RequestStatus status =
      KycVerificationResponse.RequestStatus.ACCEPTED;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private EntityType entityType;

  private String value;

  private boolean isVerified;

  @Enumerated(EnumType.STRING)
  private VerificationCode errorCode;

  @ManyToOne(optional = false)
  @JoinColumn(name = "user_id")
  private User user;

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private Timestamp createdAt;

  @UpdateTimestamp
  @Column(nullable = false)
  private Timestamp updatedAt;

  @RequiredArgsConstructor
  public enum EntityType {
    READY_TO_INVEST("ready_to_invest"),
    NAME("name"),
    PAN("pan"),
    DOB("date_of_birth");
    @Getter @JsonProperty private final String value;
  }
}
