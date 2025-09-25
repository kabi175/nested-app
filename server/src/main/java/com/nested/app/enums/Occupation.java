package com.nested.app.enums;

public enum Occupation {
    BUSINESS("business"),
    SERVICE("service"),
    PROFESSIONAL("professional"),
    AGRICULTURIST("agriculturist"),
    RETIRED("retired"),
    HOUSEWIFE("housewife"),
    STUDENT("student"),
    OTHERS("others"),
    DOCTOR("doctor"),
    PRIVATE_SECTOR_SERVICE("private_sector_service"),
    PUBLIC_SECTOR_SERVICE("public_sector_service"),
    FOREX_DEALER("forex_dealer"),
    GOVERNMENT_SERVICE("government_service"),
    UNKNOWN_OR_NOT_APPLICABLE("unknown_or_not_applicable");

    private final String value;

    Occupation(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Occupation fromValue(String value) {
        for (Occupation occupation : values()) {
            if (occupation.value.equalsIgnoreCase(value)) {
                return occupation;
            }
        }
        throw new IllegalArgumentException("Unknown occupation: " + value);
    }
}