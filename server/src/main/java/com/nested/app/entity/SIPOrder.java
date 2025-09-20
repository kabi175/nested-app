package com.nested.app.entity;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@Entity
@DiscriminatorValue("SIP")
@EqualsAndHashCode(callSuper = true)
public class SIPOrder extends Order{

    @Column(nullable = false)
    private Frequency frequency;

    @Column(nullable = false)
    private boolean isActive = true;

    @Column(nullable = false)
    private String mandateID;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Embedded
    private SIPStepUp sipStepUp;

    public static enum Frequency {
        DAILY,
        WEEKLY,
        MONTHLY,
        QUARTERLY,
        HALF_YEARLY,
        YEARLY
    }

    @Data
    @Embeddable
    public static class SIPStepUp {
        private Double stepUpAmount;

        private LocalDate stepUpStartDate;

        private LocalDate stepUpEndDate;

        private SIPStepUp.Frequency stepUpFrequency;


        public static enum Frequency {
            HALF_YEARLY,
            YEARLY
        }

    }
}
