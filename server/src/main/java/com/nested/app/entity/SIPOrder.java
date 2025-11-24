package com.nested.app.entity;

import com.fasterxml.jackson.annotation.JsonValue;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.sql.Timestamp;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;

/**
 * Specialized Order representing a Systematic Investment Plan (SIP). Includes scheduling metadata
 * (nextRunDate, status, lastOrderRef) to allow internal scheduler to run executions without a
 * separate schedule entity.
 */
@Data
@Valid
@Entity
@DiscriminatorValue("SIP")
@EqualsAndHashCode(callSuper = true)
public class SIPOrder extends Order {
  @NotNull
  @Enumerated(EnumType.STRING)
  private Frequency frequency = Frequency.MONTHLY;

  @NotNull private boolean isActive = false;


  /** First date on which SIP executions may occur */
  @NotNull private LocalDate startDate;

  /** Final date after which SIP should cease */
  @NotNull private LocalDate endDate;

  /** Next scheduled execution date (updated after each successful run) */
  private LocalDate nextRunDate; // initialized externally to startDate

  /** Last provider order reference created for an execution cycle */
  private String lastOrderRef;

  /** Timestamp of last attempt to place or poll the order */
  private Timestamp lastAttemptAt;

  /** Incremented on failures (used for backoff / error threshold) */
  private Integer failureCount = 0;

  /** Last provider transaction id resolved (for idempotency) */
  private String lastProviderTransactionId;

  @Enumerated(EnumType.STRING)
  private ScheduleStatus scheduleStatus = ScheduleStatus.ACTIVE;

  @Embedded private SIPStepUp sipStepUp;

  public enum Frequency {
    MONTHLY,
  }

  @Data
  @Embeddable
  public static class SIPStepUp {
    @NotNull private Double stepUpAmount;

    @NotNull private LocalDate stepUpStartDate;

    @NotNull private LocalDate stepUpEndDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    private SIPStepUp.Frequency stepUpFrequency = Frequency.YEARLY;

    @AllArgsConstructor
    public enum Frequency {
      MONTHLY("monthly"),
      QUARTERLY("quarterly"),
      HALF_YEARLY("half-yearly"),
      YEARLY("yearly");

      @JsonValue @Getter private final String value;
    }
  }

  public boolean due(LocalDate today) {
    // Order is due if ACTIVE and today >= nextRunDate but not past endDate
    return scheduleStatus == ScheduleStatus.ACTIVE
        && !today.isBefore(nextRunDate)
        && (today.isBefore(endDate) || today.isEqual(endDate));
  }

  public enum ScheduleStatus {
    ACTIVE,
    RUNNING,
    ERROR,
    COMPLETED,
    PAUSED
  }
}
