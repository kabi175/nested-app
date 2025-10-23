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
   * Retrieves orders by goal ID
   *
   * @param goalId Goal ID to filter orders
   * @return List of orders for the specified goal
   */
  List<OrderDTO> getOrdersByGoal(String goalId);

  /**
   * Retrieves orders by goal ID (alias method for API compatibility)
   *
   * @param goalId Goal ID to filter orders
   * @return List of orders for the specified goal
   */
  List<OrderDTO> getOrdersByGoalId(String goalId);

  /**
   * Retrieves all orders
   *
   * @return List of all orders
   */
  List<OrderDTO> getAllOrders();

  /**
   * Places new orders
   *
   * @param orderRequest
   * @return
   */
  List<OrderDTO> placeOrder(Long goalID, OrderRequestDTO orderRequest);
}
