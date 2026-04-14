package com.nested.app.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import java.util.concurrent.TimeUnit;
import org.springframework.cache.caffeine.CaffeineCache;
import org.springframework.cache.support.SimpleCacheManager;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.List;

@Configuration
public class CacheConfig {

  public static final String GOAL_PORTFOLIO = "goalPortfolio";
  public static final String GOAL_MONTHLY_SIP = "goalMonthlySip";
  public static final String APP_VERSION = "appVersion";

  @Bean
  CacheManager cacheManager() {
    var manager = new SimpleCacheManager();
    manager.setCaches(List.of(
        buildCache(GOAL_PORTFOLIO, 5, 2_000),
        buildCache(GOAL_MONTHLY_SIP, 5, 2_000),
        buildCache(APP_VERSION, 60, 100)
    ));
    return manager;
  }

  private CaffeineCache buildCache(String name, int ttlMinutes, int maxSize) {
    return new CaffeineCache(name,
        Caffeine.newBuilder()
            .expireAfterWrite(ttlMinutes, TimeUnit.MINUTES)
            .maximumSize(maxSize)
            .recordStats()
            .build());
  }
}
