package com.nested.app.config;

import com.nested.app.listeners.JobHistoryListener;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.quartz.QuartzProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;

/**
 * Configuration for Quartz Scheduler. Registers global job listeners for execution history tracking
 * and monitoring.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class QuartzConfig {

  private final JobHistoryListener jobHistoryListener;

  /**
   * Configures the Quartz SchedulerFactoryBean with global job listeners. The JobHistoryListener is
   * registered to track execution history for all jobs.
   *
   * @param applicationContext the Spring application context
   * @param quartzProperties the Quartz properties from application.properties
   * @return configured SchedulerFactoryBean
   */
  @Bean
  public SchedulerFactoryBean schedulerFactoryBean(
      ApplicationContext applicationContext, QuartzProperties quartzProperties) {
    SchedulerFactoryBean schedulerFactoryBean = new SchedulerFactoryBean();

    // Set the application context to enable Spring-managed job beans
    schedulerFactoryBean.setApplicationContext(applicationContext);

    // Register global job listener for execution history
    schedulerFactoryBean.setGlobalJobListeners(jobHistoryListener);

    // Wait for jobs to complete on shutdown (graceful shutdown)
    schedulerFactoryBean.setWaitForJobsToCompleteOnShutdown(true);

    // Set autoStartup to true (default behavior)
    schedulerFactoryBean.setAutoStartup(true);

    log.info("Quartz SchedulerFactoryBean configured with JobHistoryListener");

    return schedulerFactoryBean;
  }
}
