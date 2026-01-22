package com.nested.app.events;

import com.nested.app.entity.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/** Event published when a user's KYC verification is completed successfully. */
public class KycCompletedEvent extends ApplicationEvent {
  @Getter private final User user;

  public KycCompletedEvent(Object source, User user) {
    super(source);
    this.user = user;
  }
}
