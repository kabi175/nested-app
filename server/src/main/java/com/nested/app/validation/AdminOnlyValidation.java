package com.nested.app.validation;

import org.springframework.stereotype.Component;

import com.nested.app.annotation.AdminOnly;
import com.nested.app.contect.UserContext;
import com.nested.app.entity.User;
import com.nested.app.utils.AppEnvironment;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;

/** Validator for AdminOnly annotation Checks if the current user has admin role */
@Component
@RequiredArgsConstructor
public class AdminOnlyValidation implements ConstraintValidator<AdminOnly, Object> {

  private final UserContext userContext;
  private final AppEnvironment appEnvironment;

  @Override
  public void initialize(AdminOnly constraintAnnotation) {
    ConstraintValidator.super.initialize(constraintAnnotation);
  }

  @Override
  public boolean isValid(Object value, ConstraintValidatorContext context) {
    try {
      // In development mode, bypass admin check
      if (appEnvironment.isDevelopment()) {
        return true;
      }
      
      User currentUser = userContext.getUser();
      return currentUser != null && User.Role.ADMIN.equals(currentUser.getRole());
    } catch (Exception e) {
      return false;
    }
  }
}
