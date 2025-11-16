package com.nested.app.services;

import com.nested.app.dto.PendingActivityResponseDTO;
import com.nested.app.enums.ActivityPriority;
import com.nested.app.enums.ActivityType;

public interface PendingActivityService {

  /**
   * Get all pending activities for a user
   *
   * @param userId User ID
   * @param type Optional filter by activity type
   * @param priority Optional filter by priority
   * @return PendingActivityResponseDTO containing all pending activities
   */
  PendingActivityResponseDTO getPendingActivities(
      Long userId, ActivityType type, ActivityPriority priority);
}
