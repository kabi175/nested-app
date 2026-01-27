package com.nested.app.client.mf.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class KycCheck {
  private String pan;
  private Status status;

  public enum Status {
    NOT_AVAILABLE,
    AVAILABLE,
    PENDING,
    SUBMITTED,
    REJECTED,
    EXPIRED;

    public static Status fromString(String status) {
      return switch (status.toLowerCase()) {
        case "available", "successful" -> AVAILABLE;
        case "pending" -> PENDING;
        case "submitted" -> SUBMITTED;
        case "rejected" -> REJECTED;
        case "expired" -> EXPIRED;
        default -> NOT_AVAILABLE;
      };
    }
  }
}
