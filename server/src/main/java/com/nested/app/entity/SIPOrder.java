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
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.Getter;

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

  private String mandateID;

  @NotNull private LocalDate startDate;

  @NotNull private LocalDate endDate;

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
}
