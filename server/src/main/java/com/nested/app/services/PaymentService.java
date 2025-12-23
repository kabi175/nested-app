package com.nested.app.services;

import com.nested.app.dto.PaymentDTO;
import com.nested.app.dto.PlaceOrderDTO;
import com.nested.app.dto.PlaceOrderPostDTO;
import com.nested.app.entity.User;

/**
 * Service interface for managing Payment entities Provides business logic for payment-related
 * operations
 *
 * @author Nested App Team
 * @version 1.0
 */
public interface PaymentService {

  /**
   * Creates a payment with multiple orders for a child
   *
   * @param placeOrderRequest Order placement request data
   * @param user Current user context
   * @return Created payment with orders
   */
  PlaceOrderDTO createPaymentWithOrders(PlaceOrderPostDTO placeOrderRequest, User user);

  /**
   * Retrieves a payment by ID
   *
   * @param paymentId Payment ID
   * @return Payment details with orders
   */
  PaymentDTO getPaymentById(Long paymentId);
}
