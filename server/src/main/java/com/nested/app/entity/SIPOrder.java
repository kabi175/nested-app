package com.nested.app.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.time.LocalDate;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@Entity
@DiscriminatorValue("SIP")
@EqualsAndHashCode(callSuper = true)
public class SIPOrder extends Order{
  @Column(nullable = false)
  private Double monthlySip;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private Frequency frequency = Frequency.MONTHLY;

  @Column(nullable = false)
  private boolean isActive = false;

    @Column(nullable = false)
    private String mandateID;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Embedded
    private SIPStepUp sipStepUp;

  public enum Frequency {
        MONTHLY,
    }

    @Data
    @Embeddable
    public static class SIPStepUp {
        private Double stepUpAmount;

        private LocalDate stepUpStartDate;

        private LocalDate stepUpEndDate;

    @Enumerated(EnumType.STRING)
    private SIPStepUp.Frequency stepUpFrequency = Frequency.YEARLY;

        public static enum Frequency {
            YEARLY
        }

    }
}
