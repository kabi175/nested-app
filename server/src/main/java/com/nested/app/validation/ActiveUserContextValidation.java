package com.nested.app.validation;

import com.nested.app.annotation.ActiveUserOnly;
import com.nested.app.context.UserContext;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ActiveUserContextValidation implements ConstraintValidator<ActiveUserOnly, UserContext> {
    @Override
    public void initialize(ActiveUserOnly constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(UserContext userContext, ConstraintValidatorContext context) {
        try {
            return userContext != null && userContext.getUser() != null && userContext.getUser().isActive();
        } catch (Exception e) {
            return false;
        }
    }
}

