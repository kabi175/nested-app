package com.nested.app.enums;

import lombok.Getter;

@Getter
public enum IncomeSlab {
  BELOW_1_LAC("upto_1lakh"),
  ABOVE_1_LAC_UPTO_5_LAC("above_1lakh_upto_5lakh"),
  ABOVE_5_LAC_UPTO_10_LAC("above_5lakh_upto_10lakh"),
  ABOVE_10_LAC_UPTO_25_LAC("above_10lakh_upto_25lakh"),
  ABOVE_25_LAC_UPTO_1_CRORE("above_25lakh_upto_1cr"),
  ABOVE_1_CRORE("above_1cr");

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
