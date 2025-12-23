package com.nested.app.services;

import com.nested.app.dto.OrderDTO;
import com.nested.app.dto.SellOrderRequestDTO;
import com.nested.app.dto.SellOrderVerifyDTO;
import com.nested.app.entity.User;
import java.util.List;

/**
 * Service interface for managing Sell Order entities Provides business logic for sell order-related
 * operations
 *
 * @author Nested App Team
 * @version 1.0
 */
public interface SellOrderService {

  /**
   * Places new sell orders
   *
   * @param sellOrderRequest Sell order request containing order details
   * @param user Current user context
   * @return List of created sell orders
   */
  List<OrderDTO> placeSellOrder(SellOrderRequestDTO sellOrderRequest, User user);

  /**
   * Verifies and confirms sell orders
   *
   * @param verifyRequest Verification request with order IDs and consent details
   * @param user Current user context
   */
  void verifySellOrder(SellOrderVerifyDTO verifyRequest, User user);
}
