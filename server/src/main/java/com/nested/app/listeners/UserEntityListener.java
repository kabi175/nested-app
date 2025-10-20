package com.nested.app.listeners;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

import com.nested.app.entity.User;
import com.nested.app.events.UserCreatedEvent;
import com.nested.app.validation.UserValidator;

import jakarta.persistence.PostPersist;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;

@Component
public class UserEntityListener {
  
  @Autowired 
  private ApplicationEventPublisher publisher;
  
  private static UserValidator userValidator;

  @Autowired
  public void setUserValidator(UserValidator validator) {
    UserEntityListener.userValidator = validator;
  }

  @PrePersist
  public void validateBeforeCreate(User user) {
    if (userValidator != null) {
      userValidator.validate(user);
    }
  }

  @PreUpdate
  public void validateBeforeUpdate(User user) {
    if (userValidator != null) {
      userValidator.validate(user);
    }
  }

  @PostPersist
  public void afterSave(User user) {
    publisher.publishEvent(new UserCreatedEvent(this, user));
  }
}
