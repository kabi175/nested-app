package com.nested.app.services;

import com.google.common.collect.Streams;
import com.nested.app.dto.MinifiedGoalDTO;
import com.nested.app.dto.OrderDTO;
import com.nested.app.dto.OrderRequestDTO;
import com.nested.app.entity.BuyOrder;
import com.nested.app.entity.Goal;
import com.nested.app.entity.Order;
import com.nested.app.entity.OrderItems;
import com.nested.app.entity.SIPOrder;
import com.nested.app.entity.User;
import com.nested.app.exception.ExternalServiceException;
import com.nested.app.repository.OrderRepository;
import com.nested.app.repository.TenantAwareGoalRepository;
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
  private final TenantAwareGoalRepository goalRepository;

  @Override
  public List<OrderDTO> getPendingOrders(Long goalId, User user) {
    List<Order> orders = orderRepository.findByGoalIdAndIsPlacedAndPaymentIsNull(goalId, false);

    return orders.stream().map(this::convertToDTO).collect(Collectors.toList());
  }

  /**
   * Retrieves orders by goal ID
   *
   * @param goalId Goal ID to filter orders
   * @param user Current user context
   * @return List of orders for the specified goal
   */
  @Override
  @Transactional(readOnly = true)
  public List<OrderDTO> getOrdersByGoalId(String goalId, User user) {
    log.info("Retrieving orders for goal ID: {} for user ID: {}", goalId, user.getId());

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
      throw new ExternalServiceException("Failed to retrieve orders for goal", e);
    }
  }

  @Override
  public List<OrderDTO> placeOrder(OrderRequestDTO orderRequest, User user) {

    var goalIds =
        Streams.concat(
                orderRequest.getSipOrder().stream().map(OrderRequestDTO.SipOrderDTO::getGoal),
                orderRequest.getBuyOrder().stream().map(OrderRequestDTO.BuyOrderDTO::getGoal))
            .filter(Objects::nonNull)
            .map(MinifiedGoalDTO::getId)
            .distinct()
            .toList();

    var goals = goalRepository.findAllById(goalIds);
    var investor = user.getInvestor();

    goals.forEach(
        goal -> {

          // Validate goal ownership
          if (!goal.getUser().equals(user)) {
            throw new IllegalArgumentException("Goal does not belong to current user");
          }
          // Validate goal investable status
          if (!goal.canInvest()) {
            throw new IllegalStateException("Goal cannot be invested in its current status");
          }
          if (goal.getStatus().equals(Goal.Status.DRAFT)) {
            goal.setStatus(Goal.Status.PAYMENT_PENDING);
          }
        });

    var goalIdVsGoal = goals.stream().collect(Collectors.toMap(Goal::getId, o -> o));

    var buyOrders =
        orderRequest.getBuyOrder().stream()
            .map(
                buyOrder -> {
                  var order = new BuyOrder();
                  order.setAmount(buyOrder.getAmount());
                  order.setUser(user);
                  order.setGoal(goalIdVsGoal.get(buyOrder.getGoal().getId()));
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
                  var goal = goalIdVsGoal.get(sipOrder.getGoal().getId());
                  order.setStartDate(LocalDate.now());
                  order.setEndDate(goal.getTargetDate().toLocalDate());
                  order.setUser(user);
                  order.setGoal(goal);
                  order.setInvestor(investor);
                  return order;
                });

    var orderForCreate = Streams.concat(buyOrders, sipOrders).toList();

    orderForCreate.stream().filter(Objects::nonNull).forEach(this::populateOrderItems);

    var orders = orderRepository.saveAll(orderForCreate);

    goalRepository.saveAll(goals);

    // Return the saved orders in proper format
    return orders.stream()
        .filter(Objects::nonNull)
        .map(this::convertToDTO)
        .collect(Collectors.toList());
  }

  private void populateOrderItems(Order order) {
    var basketFunds = order.getGoal().getBasket().getBasketFunds();
    var totalAmount = order.getAmount();

    var amountAllocation =
        new java.util.ArrayList<>(
            basketFunds.stream()
                .map(f -> f.getAllocationPercentage() / 100.0 * totalAmount)
                .map(amount -> amount / 100 * 100)
                .toList());

    var totalAllocation = amountAllocation.stream().reduce(Double::sum).orElse(0.0);
    var correction = totalAmount - (totalAllocation - amountAllocation.getLast());
    amountAllocation.set(amountAllocation.size() - 1, correction);

    var orderItemsList = new java.util.ArrayList<OrderItems>();
    for (int i = 0; i < basketFunds.size(); i++) {
      var basketFund = basketFunds.get(i);
      var orderItem = new OrderItems();
      orderItem.setOrder(order);
      orderItem.setFund(basketFund.getFund());
      orderItem.setAmount(amountAllocation.get(i));
      orderItem.setUser(order.getUser());
      orderItemsList.add(orderItem);
    }

    order.setItems(orderItemsList);
  }

  /**
   * Converts Order entity to OrderDTO
   *
   * @param order Order entity
   * @return OrderDTO
   */
  private OrderDTO convertToDTO(Order order) {
    log.debug("Converting Order entity to DTO for ID: {}", order.getId());
    return OrderDTO.fromEntity(order);
  }
}
