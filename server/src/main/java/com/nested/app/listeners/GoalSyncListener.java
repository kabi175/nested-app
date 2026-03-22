package com.nested.app.listeners;

import com.nested.app.config.CacheConfig;
import com.nested.app.events.GoalSyncEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/**
 * Evicts cached portfolio values for a goal after its data changes.
 * Replaces the old Quartz-based GoalSyncJob scheduling — cache eviction is instant
 * and the next read recomputes fresh values from the DB.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class GoalSyncListener {

  private final CacheManager cacheManager;

  @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
  public void on(GoalSyncEvent event) {
    Long goalId = event.goalId();
    Long userId = event.user().getId();
    String portfolioKey = goalId + ":" + userId;

    evict(CacheConfig.GOAL_PORTFOLIO, portfolioKey);
    evict(CacheConfig.GOAL_MONTHLY_SIP, goalId);

    log.info("Evicted portfolio cache for goalId={}, userId={}", goalId, userId);
  }

  private void evict(String cacheName, Object key) {
    var cache = cacheManager.getCache(cacheName);
    if (cache != null) {
      cache.evict(key);
    }
  }
}
