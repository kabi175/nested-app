package com.nested.app.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum IncomeSource {
    SALARY("salary"),
    BUSINESS_INCOME("business_income"),
    ANCESTRAL_PROPERTY("ancestral_property"),
    RENTAL_INCOME("rental_income"),
    PRIZE_MONEY("prize_money"),
    ROYALTY("royalty"),
    OTHERS("others");

  @JsonValue private final String value;

    IncomeSource(String value) {
        this.value = value;
    }

    public static IncomeSource fromValue(String value) {
        for (IncomeSource source : values()) {
            if (source.value.equalsIgnoreCase(value)) {
                return source;
            }
        }
        throw new IllegalArgumentException("Unknown income source: " + value);
    }
}
