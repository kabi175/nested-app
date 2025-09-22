package com.nested.app.annotation;

import com.nested.app.validation.ActiveFundValidation;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.FIELD) // class-level
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ActiveFundValidation.class)
@Documented
public @interface ActiveFundOnly {
    String message() default "Fund must be active";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
