package com.nested.app.annotation;

import com.nested.app.validation.AdminOnlyValidation;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Annotation to validate that the current user has admin role Can be applied to methods or
 * parameters
 */
@Target({ElementType.METHOD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = {AdminOnlyValidation.class})
@Documented
public @interface AdminOnly {
  String message() default "Access denied - Admin role required";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};
}
