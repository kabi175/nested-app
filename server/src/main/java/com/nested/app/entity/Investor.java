package com.nested.app.entity;

import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.sql.Timestamp;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@Entity
@Table(name = "investors")
public class Investor {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Status investorStatus;

  private String tarakkiInvestorRef;
  private String investorType; // Indiviadual, minor

  @CreationTimestamp
  @Column(nullable = false, updatable = false)
  private Timestamp createdAt;

  @UpdateTimestamp
  @Column(nullable = false)
  private Timestamp updatedAt;

  @RequiredArgsConstructor
  public enum Status {
    INCOMPLETE_DETAILS("incomplete_detail"),
    PENDING_KYC("incomplete_kyc_details"),
    PENDING_NOMINEE("pending_nominee_authentication"),
    UNDER_REVIEW("under_review"),
    READY_TO_INVEST("ready_to_invest");

    @JsonValue @Getter private final String value;

    public static Status fromValue(String value) {
      for (Status status : Status.values()) {
        if (status.value.equalsIgnoreCase(value)) {
          return status;
        }
      }
      throw new IllegalArgumentException("Unknown status value: " + value);
    }
  }
}
