package com.nested.app.validation;

import com.nested.app.annotation.AdminOnly;
import com.nested.app.contect.UserContext;
import com.nested.app.entity.User;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/** Validator for AdminOnly annotation Checks if the current user has admin role */
@Component
@RequiredArgsConstructor
public class AdminOnlyValidation implements ConstraintValidator<AdminOnly, Object> {

  private final UserContext userContext;

  @Override
  public void initialize(AdminOnly constraintAnnotation) {
    ConstraintValidator.super.initialize(constraintAnnotation);
  }

  @Override
  public boolean isValid(Object value, ConstraintValidatorContext context) {
    try {
      User currentUser = userContext.getUser();
      return currentUser != null && User.Role.ADMIN.equals(currentUser.getRole());
    } catch (Exception e) {
      return false;
    }
  }
}
