package com.nested.app.config;

import com.sendgrid.SendGrid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SendGridConfig {

  @Value("${sendgrid.api_key}")
  private String apiKey;

  @Bean
  public SendGrid init() {
    return new SendGrid(apiKey);
  }
}
