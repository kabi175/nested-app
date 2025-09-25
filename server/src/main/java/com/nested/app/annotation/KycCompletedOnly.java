package com.nested.app.annotation;

import com.nested.app.contect.ClientContext;
import com.nested.app.entity.Investor;
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

    class KycCompletedOnlyValidation implements ConstraintValidator<KycCompletedOnly, Investor> {
        @Override
        public void initialize(KycCompletedOnly constraintAnnotation) {
            ConstraintValidator.super.initialize(constraintAnnotation);
        }

        @Override
        public boolean isValid(Investor investor, ConstraintValidatorContext context) {
            return investor != null && Objects.equals(investor.getKycStatus(), Investor.KYCStatus.COMPLETED);
        }
    }

    class KycCompletedOnlyClientContentValidation implements ConstraintValidator<KycCompletedOnly, ClientContext> {
        @Override
        public void initialize(KycCompletedOnly constraintAnnotation) {
            ConstraintValidator.super.initialize(constraintAnnotation);
        }

        @Override
        public boolean isValid(ClientContext clientContext, ConstraintValidatorContext context) {
            try {
                if (clientContext == null) {
                    return false;
                }
                Investor investor = clientContext.getInvestor();
                return investor != null && Objects.equals(investor.getKycStatus(), Investor.KYCStatus.COMPLETED);
            } catch (Exception e) {
                return false;
            }
        }
    }

}

