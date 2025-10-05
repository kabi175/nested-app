package com.nested.app.annotation;

import com.nested.app.contect.UserContext;
import com.nested.app.entity.User;
import jakarta.validation.Constraint;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.util.Objects;

@Target(ElementType.FIELD) // class-level
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = {KycCompletedOnly.KycCompletedOnlyValidation.class})
@Documented
public @interface KycCompletedOnly {
  String message() default "User must be active";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};

  class KycCompletedOnlyValidation implements ConstraintValidator<KycCompletedOnly, User> {
    @Override
    public void initialize(KycCompletedOnly constraintAnnotation) {
      ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(User user, ConstraintValidatorContext context) {
      return user != null && Objects.equals(user.getKycStatus(), User.KYCStatus.COMPLETED);
    }
  }

  class KycCompletedOnlyClientContentValidation
      implements ConstraintValidator<KycCompletedOnly, UserContext> {
    @Override
    public void initialize(KycCompletedOnly constraintAnnotation) {
      ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(UserContext userContext, ConstraintValidatorContext context) {
      try {
        if (userContext == null) {
          return false;
        }
        User user = userContext.getUser();
        return user != null && Objects.equals(user.getKycStatus(), User.KYCStatus.COMPLETED);
      } catch (Exception e) {
        return false;
      }
    }
  }
}
