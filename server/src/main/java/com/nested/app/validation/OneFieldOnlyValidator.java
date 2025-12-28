package com.nested.app.validation;

import com.nested.app.annotation.OneFieldOnly;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import java.lang.reflect.Field;

public class OneFieldOnlyValidator implements ConstraintValidator<OneFieldOnly, Object> {

    private String firstFieldName;
    private String secondFieldName;

    @Override
    public void initialize(OneFieldOnly constraintAnnotation) {
        this.firstFieldName = constraintAnnotation.first();
        this.secondFieldName = constraintAnnotation.second();
    }

    @Override
    public boolean isValid(Object value, ConstraintValidatorContext context) {
        if (value == null) return true;

        try {
            Field firstField = value.getClass().getDeclaredField(firstFieldName);
            Field secondField = value.getClass().getDeclaredField(secondFieldName);

            firstField.setAccessible(true);
            secondField.setAccessible(true);

            Object firstValue = firstField.get(value);
            Object secondValue = secondField.get(value);

            boolean hasFirst = firstValue != null;
            boolean hasSecond = secondValue != null;

            return hasFirst ^ hasSecond; // XOR: exactly one is set

        } catch (NoSuchFieldException | IllegalAccessException e) {
      throw new IllegalArgumentException(
          "Invalid field names in @OneFieldOnly: " + e.getMessage(), e);
        }
    }
}
