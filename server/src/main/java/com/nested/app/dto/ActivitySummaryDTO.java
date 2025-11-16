package com.nested.app.dto;

import com.nested.app.enums.ActivityType;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivitySummaryDTO {
  private Integer totalCount;
  private Map<ActivityType, Long> byType;
}
