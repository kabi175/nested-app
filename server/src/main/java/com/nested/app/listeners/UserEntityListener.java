package com.nested.app.listeners;

import com.nested.app.entity.User;
import com.nested.app.events.UserCreatedEvent;
import jakarta.persistence.PostPersist;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class UserEntityListener {
  @Autowired private ApplicationEventPublisher publisher;

  @PostPersist
  public void afterSave(User user) {
    publisher.publishEvent(new UserCreatedEvent(this, user));
  }
}
