package com.nested.app.services;

import com.nested.app.dto.PaymentDTO;
import com.nested.app.dto.PlaceOrderDTO;
import com.nested.app.dto.PlaceOrderPostDTO;
import com.nested.app.dto.VerifyOrderDTO;
import java.util.List;

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
   * @return Created payment with orders
   */
  PlaceOrderDTO createPaymentWithOrders(PlaceOrderPostDTO placeOrderRequest);

  /**
   * Verifies a payment using verification code
   *
   * @param verifyOrderRequest Payment verification request data
   * @return Verified payment data
   */
  PlaceOrderDTO verifyPayment(VerifyOrderDTO verifyOrderRequest);

  PaymentDTO iniatePayment(Long paymentID, String ipAddress);

  /**
   * Retrieves all payments
   *
   * @return List of all payments
   */
  List<PaymentDTO> getAllPayments();

  /**
   * Retrieves payment by ID
   *
   * @param paymentId Payment ID
   * @return Payment data
   */
  PaymentDTO getPaymentById(Long paymentId);

  /**
   * Retrieves payments by child ID
   *
   * @param childId Child ID
   * @return List of payments for the specified child
   */
  List<PaymentDTO> getPaymentsByChildId(Long childId);

  /**
   * Retrieves payments by user ID
   *
   * @param userId User ID
   * @return List of payments for the specified user
   */
  List<PaymentDTO> getPaymentsByUserId(Long userId);

  void markPaymentSuccess(String paymentRef);

  void markPaymentFailure(String paymentRef);
}
