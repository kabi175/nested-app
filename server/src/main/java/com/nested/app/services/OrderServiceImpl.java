package com.nested.app.services;

import com.google.common.collect.Streams;
import com.nested.app.contect.UserContext;
import com.nested.app.dto.OrderDTO;
import com.nested.app.dto.OrderRequestDTO;
import com.nested.app.entity.BuyOrder;
import com.nested.app.entity.Order;
import com.nested.app.entity.SIPOrder;
import com.nested.app.repository.GoalRepository;
import com.nested.app.repository.OrderRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for managing Order entities Provides business logic for order-related
 * operations
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
  private final GoalRepository goalRepository;
  private final UserContext userContext;

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
      List<OrderDTO> orderDTOs =
          orders.stream().map(this::convertToDTO).collect(Collectors.toList());

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
      List<OrderDTO> orderDTOs =
          orders.stream().map(this::convertToDTO).collect(Collectors.toList());

      log.info("Successfully retrieved {} orders", orderDTOs.size());
      return orderDTOs;

    } catch (Exception e) {
      log.error("Error retrieving all orders: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to retrieve orders", e);
    }
  }

  @Override
  public List<OrderDTO> placeOrder(Long goalID, OrderRequestDTO orderRequest) {
    var goal = goalRepository.findById(goalID).orElseThrow();
    var investor = goal.getChild().getInvestor();

    // Validate goal ownership
    if (!goal.getUser().equals(userContext.getUser())) {
      throw new IllegalArgumentException("Goal does not belong to current user");
    }
    // Validate goal investable status
    if (!goal.canInvest()) {
      throw new IllegalStateException("Goal cannot be invested in its current status");
    }

    var buyOrders =
        orderRequest.getBuyOrder().stream()
            .map(
                buyOrder -> {
                  var order = new BuyOrder();
                  order.setAmount(buyOrder.getAmount());
                  order.setUser(userContext.getUser());
                  order.setGoal(goal);
                  order.setInvestor(investor);
                  return order;
                });

    var sipOrders =
        orderRequest.getSipOrder().stream()
            .map(
                sipOrder -> {
                  var order = new SIPOrder();
                  order.setAmount(sipOrder.getAmount());

                  if (sipOrder.getSetupOption() != null) {
                    order.setSipStepUp(sipOrder.getSetupOption().toEntity());
                  }
                  order.setStartDate(LocalDate.now());
                  order.setEndDate(goal.getTargetDate().toLocalDate());
                  order.setUser(userContext.getUser());
                  order.setGoal(goal);
                  order.setInvestor(investor);
                  return order;
                });

    var orders = orderRepository.saveAll(Streams.concat(buyOrders, sipOrders).toList());

    // Return the saved orders in proper format
    return orders.stream()
        .filter(Objects::nonNull)
        .map(this::convertToDTO)
        .collect(Collectors.toList());
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
    dto.setAmount(order.getAmount());
    dto.setStatus(order.getStatus());
    return dto;
  }
}
