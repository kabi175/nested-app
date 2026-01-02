package com.nested.app.validation;

import com.nested.app.annotation.ActiveUserOnly;
import com.nested.app.entity.User;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ActiveUserValidation implements ConstraintValidator<ActiveUserOnly, User> {
    @Override
    public void initialize(ActiveUserOnly constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(User user, ConstraintValidatorContext context) {
        return user != null && user.isActive();
    }
}
