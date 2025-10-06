package com.nested.app.annotation;

import com.nested.app.validation.OrderRequestValidation;
import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.*;

/**
 * Custom validation annotation for order request validation Ensures that either buy order or SIP
 * order is provided, but not both
 */
@Documented
@Constraint(validatedBy = OrderRequestValidation.class)
@Target({ElementType.TYPE, ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidOrderRequest {
  String message() default "Either buy order or SIP order must be provided, but not both";

  Class<?>[] groups() default {};

  Class<? extends Payload>[] payload() default {};
}
