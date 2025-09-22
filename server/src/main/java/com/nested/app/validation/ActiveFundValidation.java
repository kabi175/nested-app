package com.nested.app.validation;

import com.nested.app.annotation.ActiveFundOnly;
import com.nested.app.entity.Fund;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ActiveFundValidation implements ConstraintValidator<ActiveFundOnly, Fund> {
    @Override
    public void initialize(ActiveFundOnly constraintAnnotation) {
        ConstraintValidator.super.initialize(constraintAnnotation);
    }

    @Override
    public boolean isValid(Fund fund, ConstraintValidatorContext context) {
        return fund.isActive();
    }
}
