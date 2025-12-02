package com.nested.app.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

/**
 * Enum representing the execution status of a Quartz job. Used to track whether a job execution
 * completed successfully or failed.
 */
@RequiredArgsConstructor
public enum JobExecutionStatus {
  SUCCESS("success"),
  FAILURE("failure");

  @Getter @JsonValue private final String value;
}
