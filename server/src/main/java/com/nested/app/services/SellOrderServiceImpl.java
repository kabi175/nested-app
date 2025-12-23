package com.nested.app.services;

import com.nested.app.client.mf.SellOrderApiClient;
import com.nested.app.client.mf.dto.OrderConsentRequest;
import com.nested.app.client.mf.dto.SellOrderDetail;
import com.nested.app.dto.MinifiedGoalDTO;
import com.nested.app.dto.OrderDTO;
import com.nested.app.dto.SellOrderRequestDTO;
import com.nested.app.dto.SellOrderVerifyDTO;
import com.nested.app.entity.Folio;
import com.nested.app.entity.Fund;
import com.nested.app.entity.Goal;
import com.nested.app.entity.Order;
import com.nested.app.entity.OrderItems;
import com.nested.app.entity.SellOrder;
import com.nested.app.entity.User;
import com.nested.app.repository.FolioRepository;
import com.nested.app.repository.FundRepository;
import com.nested.app.repository.OrderItemsRepository;
import com.nested.app.repository.OrderRepository;
import com.nested.app.repository.TenantAwareGoalRepository;
import com.nested.app.repository.TransactionRepository;
import com.nested.app.utils.IpUtils;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Service implementation for managing Sell Order entities Provides business logic for sell
 * order-related operations including validation of available holdings and folio auto-selection
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class SellOrderServiceImpl implements SellOrderService {

  private final OrderRepository orderRepository;
  private final OrderItemsRepository orderItemsRepository;
  private final TenantAwareGoalRepository goalRepository;
  private final FundRepository fundRepository;
  private final FolioRepository folioRepository;
  private final TransactionRepository transactionRepository;
  private final SellOrderApiClient sellOrderApiClient;
  private final SellOrderSchedulerService sellOrderSchedulerService;

  @Override
  public List<OrderDTO> placeSellOrder(SellOrderRequestDTO sellOrderRequest, User user) {
    if (user == null) {
      throw new IllegalStateException("User not found in context");
    }

    var investor = user.getInvestor();
    if (investor == null) {
      throw new IllegalStateException("Investor not found for user");
    }

    // Validate and collect goal IDs
    var goalIds =
        sellOrderRequest.getSellOrders().stream()
            .map(SellOrderRequestDTO.SellOrderItemDTO::getGoal)
            .map(MinifiedGoalDTO::getId)
            .distinct()
            .collect(Collectors.toList());

    var goals = goalRepository.findAllById(goalIds);
    if (goals.size() != goalIds.size()) {
      throw new IllegalArgumentException("One or more goals not found");
    }

    // Validate goal ownership
    goals.forEach(
        goal -> {
          if (!goal.getUser().equals(user)) {
            throw new IllegalArgumentException("Goal does not belong to current user");
          }
        });

    var goalMap = goals.stream().collect(Collectors.toMap(Goal::getId, g -> g));

    // Collect fund IDs
    var fundIds =
        sellOrderRequest.getSellOrders().stream()
            .map(SellOrderRequestDTO.SellOrderItemDTO::getFundId)
            .distinct()
            .collect(Collectors.toList());

    var funds = fundRepository.findAllById(fundIds);
    if (funds.size() != fundIds.size()) {
      throw new IllegalArgumentException("One or more funds not found");
    }

    var fundMap = funds.stream().collect(Collectors.toMap(Fund::getId, f -> f));

    // Validate holdings and auto-select folios
    Map<Long, Folio> fundFolioMap = new HashMap<>();
    for (var sellOrderItem : sellOrderRequest.getSellOrders()) {
      var fundId = sellOrderItem.getFundId();
      var goalId = sellOrderItem.getGoal().getId();

      // Check available units for this fund and goal
      var availableUnits = calculateAvailableUnits(user.getId(), goalId, fundId);

      if (availableUnits <= 0) {
        throw new IllegalArgumentException(
            "No holdings found for fund ID: " + fundId + " in goal ID: " + goalId);
      }

      // Validate amount/units against holdings
      if (sellOrderItem.getUnits() != null && sellOrderItem.getUnits() > availableUnits) {
        throw new IllegalArgumentException(
            String.format(
                "Insufficient units for fund ID: %d. Available: %.4f, Requested: %.4f",
                fundId, availableUnits, sellOrderItem.getUnits()));
      }

      if (sellOrderItem.getAmount() != null) {
        var fund = fundMap.get(fundId);
        var requiredUnits = sellOrderItem.getAmount() / fund.getNav();
        if (requiredUnits > availableUnits) {
          throw new IllegalArgumentException(
              String.format(
                  "Insufficient units for fund ID: %d. Available: %.4f, Required for amount: %.4f",
                  fundId, availableUnits, requiredUnits));
        }
      }

      // Auto-select folio for this fund
      var folio =
          folioRepository
              .findFirstByFundIdAndUser(fundId, user)
              .orElseThrow(
                  () -> new IllegalArgumentException("No folio found for fund ID: " + fundId));

      // Validate folio belongs to user
      if (!folio.getUser().equals(user)) {
        throw new IllegalArgumentException(
            "Folio does not belong to current user for fund ID: " + fundId);
      }

      fundFolioMap.put(fundId, folio);
    }

    // Create sell orders and place them via API
    List<Order> createdOrders = new ArrayList<>();

    for (var sellOrderItem : sellOrderRequest.getSellOrders()) {
      var goal = goalMap.get(sellOrderItem.getGoal().getId());
      var fund = fundMap.get(sellOrderItem.getFundId());
      var folio = fundFolioMap.get(sellOrderItem.getFundId());

      // Create SellOrder entity
      var sellOrder = new SellOrder();
      sellOrder.setAmount(sellOrderItem.getAmount());
      sellOrder.setReason(sellOrderItem.getReason());
      sellOrder.setUser(user);
      sellOrder.setGoal(goal);
      sellOrder.setInvestor(investor);
      sellOrder.setStatus(Order.OrderStatus.NOT_PLACED);

      var savedOrder = orderRepository.save(sellOrder);

      // Create OrderItems
      var orderItem = new OrderItems();
      orderItem.setOrder(savedOrder);
      orderItem.setFund(fund);
      orderItem.setAmount(sellOrderItem.getAmount() != null ? sellOrderItem.getAmount() : 0.0);
      orderItem.setUser(user);
      orderItem.setProcessingState(OrderItems.ProcessingState.SUCCESS);
      // TODO: handle the  processing state properly

      orderItemsRepository.save(orderItem);

      // Place order via API
      var sellOrderDetail = new SellOrderDetail();
      sellOrderDetail.setAccountID(investor.getAccountRef());
      sellOrderDetail.setFundID(fund.getIsinCode());
      sellOrderDetail.setFolio(folio.getRef());
      sellOrderDetail.setAmount(sellOrderItem.getAmount());
      sellOrderDetail.setUnits(sellOrderItem.getUnits());

      ServletRequestAttributes attributes =
          (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
      if (attributes == null) {
        throw new RuntimeException("Error while getting request");
      }
      HttpServletRequest request = attributes.getRequest();
      var ipAddress = IpUtils.getClientIpAddress(request);
      sellOrderDetail.setUserIP(ipAddress);

      try {
        var placedOrder = sellOrderApiClient.placeOrder(sellOrderDetail).block();
        if (placedOrder != null && placedOrder.getRef() != null) {
          orderItem.setRef(placedOrder.getRef());
          orderItemsRepository.save(orderItem);
          savedOrder.setStatus(Order.OrderStatus.PLACED);
          orderRepository.save(savedOrder);

          log.info(
              "Sell order placed successfully. Order ID: {}, Ref: {}",
              savedOrder.getId(),
              placedOrder.getRef());

          // Schedule RedeemOrderTrackerJob with triggers: 5s, 10min, every 6hrs
          try {
            sellOrderSchedulerService.scheduleRedeemOrderTrackerJob(placedOrder.getRef());
          } catch (Exception schedulerException) {
            log.error(
                "Failed to schedule RedeemOrderTrackerJob for order ref: {}",
                placedOrder.getRef(),
                schedulerException);
            // Don't fail the order placement if scheduling fails
          }
        } else {
          throw new RuntimeException("Failed to place sell order - no reference returned");
        }
      } catch (Exception e) {
        log.error("Failed to place sell order for fund ID: {}", fund.getId(), e);
        savedOrder.setStatus(Order.OrderStatus.FAILED);
        orderRepository.save(savedOrder);
        throw new RuntimeException("Failed to place sell order: " + e.getMessage(), e);
      }

      createdOrders.add(savedOrder);
    }

    // Return DTOs
    return createdOrders.stream().map(OrderDTO::fromEntity).collect(Collectors.toList());
  }

  @Override
  public void verifySellOrder(SellOrderVerifyDTO verifyRequest, User user) {
    if (user == null) {
      throw new IllegalStateException("User not found in context");
    }

    // Fetch orders
    var orders = orderRepository.findAllById(verifyRequest.getOrderIds());
    if (orders.size() != verifyRequest.getOrderIds().size()) {
      throw new IllegalArgumentException("One or more orders not found");
    }

    // Validate ownership
    orders.forEach(
        order -> {
          if (!order.getUser().equals(user)) {
            throw new IllegalArgumentException("Order does not belong to current user");
          }
        });

    // Collect order refs for consent and confirmation
    List<String> orderRefs =
        orders.stream()
            .flatMap(order -> order.getItems().stream())
            .map(OrderItems::getRef)
            .filter(ref -> ref != null && !ref.isEmpty())
            .distinct()
            .collect(Collectors.toList());

    if (orderRefs.isEmpty()) {
      throw new IllegalStateException("No valid order references found for verification");
    }

    // Get email and mobile from user context
    String email = user.getEmail();
    String mobile = user.getPhoneNumber();

    if (email == null || email.isEmpty()) {
      throw new IllegalStateException("User email not found in profile");
    }

    try {
      // Update consent for each order
      for (String orderRef : orderRefs) {
        var consentRequest =
            OrderConsentRequest.builder()
                .orderRef(orderRef)
                .email(email)
                .mobile(mobile)
                .state("confirmed")
                .build();

        sellOrderApiClient.updateConsent(consentRequest).block();
        log.info("Updated consent for order ref: {} with user email: {}", orderRef, email);
      }

      log.info("Confirmed {} sell orders", orderRefs.size());

      // Schedule fulfillment jobs for order tracking
      //      sellOrderSchedulerService.scheduleSellOrderStatusJobs(orderRefs);
      log.info("Scheduled fulfillment jobs for {} sell orders", orderRefs.size());

    } catch (Exception e) {
      log.error("Failed to verify sell orders", e);
      throw new RuntimeException("Failed to verify sell orders: " + e.getMessage(), e);
    }
  }

  /**
   * Calculates available units for a specific fund and goal by summing transactions
   *
   * @param userId User ID
   * @param goalId Goal ID
   * @param fundId Fund ID
   * @return Total available units (can be negative if oversold, but shouldn't happen)
   */
  private double calculateAvailableUnits(Long userId, Long goalId, Long fundId) {
    var transactions = transactionRepository.findByUserIdAndGoalId(userId, goalId);

    return transactions.stream()
        .filter(t -> t.getFund().getId().equals(fundId))
        .mapToDouble(t -> t.getUnits())
        .sum();
  }
}
