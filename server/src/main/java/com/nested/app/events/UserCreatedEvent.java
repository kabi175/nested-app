package com.nested.app.events;

import com.nested.app.entity.User;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

public class UserCreatedEvent extends ApplicationEvent {
  @Getter private final User user;

  public UserCreatedEvent(Object source, User user) {
    super(source);
    this.user = user;
  }
}
