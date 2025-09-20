package com.nested.app.entity;

import jakarta.persistence.Embeddable;
import lombok.Data;

import java.time.LocalDate;

@Data
@Embeddable
public class SIPStepUp {
    private Double stepUpAmount;

    private LocalDate stepUpStartDate;

    private LocalDate stepUpEndDate;

    private SIPOrder.Frequency stepUpFrequency;


    public static enum Frequency {
        HALF_YEARLY,
        YEARLY
    }

}
