package com.nested.app.annotation;

import com.nested.app.validation.ActiveUserContextValidation;
import com.nested.app.validation.ActiveUserValidation;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.FIELD) // class-level
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = {ActiveUserValidation.class, ActiveUserContextValidation.class})
@Documented
public @interface ActiveUserOnly {
    String message() default "User must be active";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
