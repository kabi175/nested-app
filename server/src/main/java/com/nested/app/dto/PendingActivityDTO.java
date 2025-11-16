package com.nested.app.dto;

import com.nested.app.enums.ActivityPriority;
import com.nested.app.enums.ActivityType;
import java.sql.Timestamp;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingActivityDTO<T> {
  private String id;
  private ActivityType type;
  private String title;
  private String description;
  private ActivityPriority priority;
  private Timestamp createdAt;
  private T metadata;
  private String actionUrl;
  private String status;
}
