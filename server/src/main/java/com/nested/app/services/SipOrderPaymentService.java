package com.nested.app.services;

import com.nested.app.dto.PlaceOrderDTO;
import com.nested.app.dto.UserActionRequest;
import com.nested.app.dto.VerifyOrderDTO;

/**
 * Service interface for managing SIP Order Payment operations. Handles verification and payment URL
 * retrieval for SIP orders specifically.
 *
 * @author Nested App Team
 * @version 1.0
 */
public interface SipOrderPaymentService {

  /**
   * Verifies a SIP order payment using verification code
   *
   * @param verifyOrderRequest Payment verification request data
   * @return Verified payment data
   */
  PlaceOrderDTO verifySipOrderPayment(VerifyOrderDTO verifyOrderRequest);

  /**
   * Fetches payment redirect URL for SIP orders
   *
   * @param paymentID Payment ID
   * @return User action request with redirect URL
   */
  UserActionRequest fetchSipOrderPaymentUrl(Long paymentID);
}
