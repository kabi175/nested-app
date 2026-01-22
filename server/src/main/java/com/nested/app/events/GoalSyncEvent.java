package com.nested.app.events;

import com.nested.app.entity.User;

/** GoalSyncEvent is published when a transaction gets created or updated. */
public record GoalSyncEvent(Long goalId, User user) {}
