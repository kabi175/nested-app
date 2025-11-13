package com.nested.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Configuration for enabling async processing in the application. Allows event listeners and other
 * components to run asynchronously without blocking the main thread.
 */
@Configuration
@EnableAsync
public class AsyncConfig {}
