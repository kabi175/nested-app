package com.nested.app.validation;

import com.nested.app.annotation.ValidOrderRequest;
import com.nested.app.dto.PlaceOrderPostDTO;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

/**
 * Custom validator for order request validation Ensures that either buy order or SIP order is
 * provided, but not both
 */
public class OrderRequestValidation
    implements ConstraintValidator<ValidOrderRequest, PlaceOrderPostDTO.OrderRequestDTO> {

  @Override
  public void initialize(ValidOrderRequest constraintAnnotation) {
    ConstraintValidator.super.initialize(constraintAnnotation);
  }

  @Override
  public boolean isValid(
      PlaceOrderPostDTO.OrderRequestDTO orderRequest, ConstraintValidatorContext context) {
    if (orderRequest == null) {
      return false;
    }

    boolean hasBuyOrder = orderRequest.getBuyOrder() != null;
    boolean hasSipOrder = orderRequest.getSipOrder() != null;

    // Either buy order or SIP order should be provided, but not both
    return hasBuyOrder || hasSipOrder;
  }
}
