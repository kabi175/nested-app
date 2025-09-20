package com.nested.app.annotation;

import com.nested.app.validation.OneFieldOnlyValidator;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

@Target(ElementType.TYPE) // class-level
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = OneFieldOnlyValidator.class)
@Documented
public @interface OneFieldOnly {

    String message() default "Exactly one of the fields must be provided";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};

    // names of the two fields
    String first();
    String second();
}
