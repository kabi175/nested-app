package com.nested.app.services;

import com.nested.app.dto.UserActionRequest;
import com.nested.app.entity.Payment;

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
   * @param paymentID Payment ID
   * @return Verified payment data
   */
  void verifySipOrderPayment(Long paymentID);

  /**
   * Fetches payment redirect URL for SIP orders
   *
   * @param paymentID Payment ID
   * @return User action request with redirect URL
   */
  UserActionRequest fetchSipOrderPaymentUrl(Long paymentID);

  void placeSipOrders(Payment payment);
}
