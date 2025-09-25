package com.nested.app.enums;

import lombok.Getter;

@Getter
public enum IncomeSource {
    SALARY("salary"),
    BUSINESS_INCOME("business_income"),
    GIFT("gift"),
    ANCESTRAL_PROPERTY("ancestral_property"),
    RENTAL_INCOME("rental_income"),
    PRIZE_MONEY("prize_money"),
    ROYALTY("royalty"),
    OTHERS("others");

    private final String value;

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
