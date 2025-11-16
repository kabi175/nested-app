package com.nested.app.dto;

import java.sql.Timestamp;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingActivityResponseDTO {
  private Long userId;
  private List<PendingActivityDTO<?>> pendingActivities;
  private ActivitySummaryDTO summary;
  private Timestamp lastUpdated;
}
