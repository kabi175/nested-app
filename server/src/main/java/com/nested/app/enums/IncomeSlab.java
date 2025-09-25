package com.nested.app.enums;

import lombok.Getter;

@Getter
public enum IncomeSlab {
    BELOW_1_LAC("below_1_lac"),
    ABOVE_1_LAC_UPTO_5_LAC("above_1_lac_upto_5_lac"),
    ABOVE_5_LAC_UPTO_10_LAC("above_5_lac_upto_10_lac"),
    ABOVE_10_LAC_UPTO_25_LAC("above_10_lac_upto_25_lac"),
    ABOVE_25_LAC_UPTO_1_CRORE("above_25_lac_upto_1_crore"),
    ABOVE_1_CRORE("above_1_crore");

    private final String value;

    IncomeSlab(String value) {
        this.value = value;
    }

    public static IncomeSlab fromValue(String value) {
        for (IncomeSlab slab : values()) {
            if (slab.value.equalsIgnoreCase(value)) {
                return slab;
            }
        }
        throw new IllegalArgumentException("Unknown income slab: " + value);
    }
}
