package com.nested.app.events;

import com.nested.app.entity.User;

/** GoalSyncEvent is published when a transaction gets created or updated. */
public record GoalSyncEvent(Long goalId, User user, int delay) {
  public GoalSyncEvent(Long goalId, User user) {
    this(goalId, user, 10); // default 10s delay
  }
}
