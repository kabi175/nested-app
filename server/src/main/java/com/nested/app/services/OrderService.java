package com.nested.app.services;

import java.util.List;

import com.nested.app.dto.OrderDTO;

/**
 * Service interface for managing Order entities
 * Provides business logic for order-related operations
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
     * Creates orders for a specific goal
     * 
     * @param goalId Goal ID to associate orders with
     * @param orders List of order data to create
     * @return List of created orders
     */
    List<OrderDTO> createOrdersForGoal(String goalId, List<OrderDTO> orders);
    
    /**
     * Retrieves all orders
     * 
     * @return List of all orders
     */
    List<OrderDTO> getAllOrders();
    
    /**
     * Creates a new order
     * 
     * @param orderDTO Order data to create
     * @return Created order data
     */
    OrderDTO createOrder(OrderDTO orderDTO);
    
    /**
     * Updates an existing order
     * 
     * @param orderDTO Order data to update
     * @return Updated order data
     */
    OrderDTO updateOrder(OrderDTO orderDTO);
}
