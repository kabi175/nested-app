package com.nested.app.entity;

import com.nested.app.enums.JobExecutionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import java.sql.Timestamp;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Entity representing the execution history of Quartz jobs. Captures timing, status, and error
 * information for job monitoring and auditing.
 */
@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(
    name = "job_history",
    indexes = {
      @Index(name = "idx_job_history_job_name", columnList = "job_name"),
      @Index(name = "idx_job_history_status", columnList = "status"),
      @Index(name = "idx_job_history_start_time", columnList = "start_time")
    })
public class JobHistory {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "job_name", nullable = false, length = 255)
  private String jobName;

  @Column(name = "trigger_name", length = 255)
  private String triggerName;

  @Column(name = "start_time", nullable = false)
  private Timestamp startTime;

  @Column(name = "end_time")
  private Timestamp endTime;

  @Column(name = "duration_ms")
  private Long durationMs;

  @Column(nullable = false)
  @Enumerated(EnumType.STRING)
  private JobExecutionStatus status;

  @Column(name = "error_message", columnDefinition = "TEXT")
  private String errorMessage;
}
