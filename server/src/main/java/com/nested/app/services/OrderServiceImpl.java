package com.nested.app.services;

import com.nested.app.dto.OrderDTO;
import com.nested.app.entity.Order;
import com.nested.app.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service implementation for managing Order entities
 * Provides business logic for order-related operations
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;

    /**
     * Retrieves orders by goal ID
     * 
     * @param goalId Goal ID to filter orders
     * @return List of orders for the specified goal
     */
    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByGoal(String goalId) {
        log.info("Retrieving orders for goal ID: {}", goalId);
        
        try {
            List<Order> orders = orderRepository.findByGoalId(Long.parseLong(goalId));
            List<OrderDTO> orderDTOs = orders.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            log.info("Successfully retrieved {} orders for goal ID: {}", orderDTOs.size(), goalId);
            return orderDTOs;
            
        } catch (NumberFormatException e) {
            log.error("Invalid goal ID format: {}", goalId);
            throw new IllegalArgumentException("Invalid goal ID format: " + goalId);
        } catch (Exception e) {
            log.error("Error retrieving orders for goal ID {}: {}", goalId, e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve orders for goal", e);
        }
    }
    
    /**
     * Retrieves orders by goal ID (alias method for API compatibility)
     * 
     * @param goalId Goal ID to filter orders
     * @return List of orders for the specified goal
     */
    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getOrdersByGoalId(String goalId) {
        return getOrdersByGoal(goalId);
    }

    /**
     * Creates orders for a specific goal
     * 
     * @param goalId Goal ID to associate orders with
     * @param orders List of order data to create
     * @return List of created orders
     */
    @Override
    public List<OrderDTO> createOrdersForGoal(String goalId, List<OrderDTO> orders) {
        log.info("Creating {} orders for goal ID: {}", orders.size(), goalId);
        
        try {
            // Set goal ID for all orders
            orders.forEach(order -> order.setGoalId(Long.parseLong(goalId)));
            
            List<Order> orderEntities = orders.stream()
                    .map(this::convertToEntity)
                    .collect(Collectors.toList());
            
            List<Order> savedOrders = orderRepository.saveAll(orderEntities);
            List<OrderDTO> savedOrderDTOs = savedOrders.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            log.info("Successfully created {} orders for goal ID: {}", savedOrderDTOs.size(), goalId);
            return savedOrderDTOs;
            
        } catch (NumberFormatException e) {
            log.error("Invalid goal ID format: {}", goalId);
            throw new IllegalArgumentException("Invalid goal ID format: " + goalId);
        } catch (Exception e) {
            log.error("Error creating orders for goal ID {}: {}", goalId, e.getMessage(), e);
            throw new RuntimeException("Failed to create orders for goal", e);
        }
    }
    
    /**
     * Retrieves all orders
     * 
     * @return List of all orders
     */
    @Override
    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        log.info("Retrieving all orders from database");
        
        try {
            List<Order> orders = orderRepository.findAll();
            List<OrderDTO> orderDTOs = orders.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            
            log.info("Successfully retrieved {} orders", orderDTOs.size());
            return orderDTOs;
            
        } catch (Exception e) {
            log.error("Error retrieving all orders: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve orders", e);
        }
    }
    
    /**
     * Creates a new order
     * 
     * @param orderDTO Order data to create
     * @return Created order data
     */
    @Override
    public OrderDTO createOrder(OrderDTO orderDTO) {
        log.info("Creating new order for goal ID: {}", orderDTO.getGoalId());
        
        try {
            Order order = convertToEntity(orderDTO);
            Order savedOrder = orderRepository.save(order);
            OrderDTO savedOrderDTO = convertToDTO(savedOrder);
            
            log.info("Successfully created order with ID: {}", savedOrder.getId());
            return savedOrderDTO;
            
        } catch (Exception e) {
            log.error("Error creating order: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create order", e);
        }
    }
    
    /**
     * Updates an existing order
     * 
     * @param orderDTO Order data to update
     * @return Updated order data
     */
    @Override
    public OrderDTO updateOrder(OrderDTO orderDTO) {
        log.info("Updating order with ID: {}", orderDTO.getId());
        
        try {
            if (orderDTO.getId() == null) {
                throw new IllegalArgumentException("Order ID cannot be null for update operation");
            }
            
            Order existingOrder = orderRepository.findById(orderDTO.getId())
                    .orElseThrow(() -> new RuntimeException("Order not found with ID: " + orderDTO.getId()));
            
            // Update fields
            existingOrder.setOrderDate(orderDTO.getOrderDate());
            existingOrder.setAmount(orderDTO.getAmount());
            existingOrder.setType(orderDTO.getType());
            existingOrder.setStatus(orderDTO.getStatus());
            existingOrder.setMonthlySip(orderDTO.getMonthlySip());
            
            Order updatedOrder = orderRepository.save(existingOrder);
            OrderDTO updatedOrderDTO = convertToDTO(updatedOrder);
            
            log.info("Successfully updated order with ID: {}", updatedOrder.getId());
            return updatedOrderDTO;
            
        } catch (Exception e) {
            log.error("Error updating order with ID {}: {}", orderDTO.getId(), e.getMessage(), e);
            throw new RuntimeException("Failed to update order", e);
        }
    }

    /**
     * Converts Order entity to OrderDTO
     * 
     * @param order Order entity
     * @return OrderDTO
     */
    private OrderDTO convertToDTO(Order order) {
        log.debug("Converting Order entity to DTO for ID: {}", order.getId());
        
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setOrderDate(order.getOrderDate());
        dto.setAmount(order.getAmount());
        dto.setType(order.getType());
        dto.setStatus(order.getStatus());
        dto.setMonthlySip(order.getMonthlySip());
        
        // Set related entity IDs if available
        if (order.getFund() != null) {
            dto.setFundId(order.getFund().getId());
        }
        
        if (order.getUser() != null) {
            dto.setUserId(order.getUser().getId());
        }
        
        if (order.getGoal() != null) {
            dto.setGoalId(order.getGoal().getId());
        }
        
        return dto;
    }

    /**
     * Converts OrderDTO to Order entity
     * 
     * @param orderDTO OrderDTO
     * @return Order entity
     */
    private Order convertToEntity(OrderDTO orderDTO) {
        log.debug("Converting OrderDTO to entity for ID: {}", orderDTO.getId());
        
        Order order = new Order();
        order.setId(orderDTO.getId());
        order.setOrderDate(orderDTO.getOrderDate());
        order.setAmount(orderDTO.getAmount());
        order.setType(orderDTO.getType());
        order.setStatus(orderDTO.getStatus());
        order.setMonthlySip(orderDTO.getMonthlySip());
        
        return order;
    }
}
