package com.nested.app.services;

import com.nested.app.dto.PlaceOrderDTO;
import com.nested.app.dto.UserActionRequest;
import com.nested.app.dto.VerifyOrderDTO;

/**
 * Service interface for managing Buy Order Payment operations. Handles verification and payment URL
 * retrieval for buy orders specifically.
 *
 * @author Nested App Team
 * @version 1.0
 */
public interface BuyOrderPaymentService {

  /**
   * Verifies a buy order payment using verification code
   *
   * @param verifyOrderRequest Payment verification request data
   * @return Verified payment data
   */
  PlaceOrderDTO verifyBuyOrderPayment(VerifyOrderDTO verifyOrderRequest);

  /**
   * Fetches payment redirect URL for buy orders
   *
   * @param paymentID Payment ID
   * @return User action request with redirect URL
   */
  UserActionRequest fetchBuyOrderPaymentUrl(Long paymentID);
}
