package com.nested.app.services;

import com.nested.app.dto.OrderDTO;
import com.nested.app.dto.OrderRequestDTO;
import java.util.List;

/**
 * Service interface for managing Order entities Provides business logic for order-related
 * operations
 *
 * @author Nested App Team
 * @version 1.0
 */
public interface OrderService {

  /**
   * Retrieves orders by goal ID (alias method for API compatibility)
   *
   * @param goalId Goal ID to filter orders
   * @return List of orders for the specified goal
   */
  List<OrderDTO> getOrdersByGoalId(String goalId);

  List<OrderDTO> getPendingOrders(Long goalId);

  /**
   * Places new orders
   *
   * @param orderRequest
   * @return
   */
  List<OrderDTO> placeOrder(OrderRequestDTO orderRequest);
}
