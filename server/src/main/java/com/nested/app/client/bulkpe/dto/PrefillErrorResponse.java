package com.nested.app.client.bulkpe.dto;

import lombok.Data;

/** DTO for Bulkpe Prefill API error response */
@Data
public class PrefillErrorResponse {
  private boolean status;
  private int statusCode;
  private Object data; // always empty {}
  private String message;
}
