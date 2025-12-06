package com.nested.app.services;

import com.nested.app.contect.UserContext;
import com.nested.app.dto.OrderAllocationProjection;
import com.nested.app.dto.OrderItemsDTO;
import com.nested.app.repository.OrderItemsRepository;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

/**
 * Service for managing OrderItems operations Provides business logic for retrieving and managing
 * order items
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderItemsService {

  private final OrderItemsRepository orderItemsRepository;
  private final UserContext userContext;

  /**
   * Retrieves paginated SIP Order Items
   *
   * @param pageable Pagination information (page number, size, sorting)
   * @return Page of OrderItemsDTO containing SIP order items for the requested page
   */
  public Page<OrderItemsDTO> getSipOrderItems(Pageable pageable) {
    log.info(
        "Fetching SIP Order Items with pagination - Page: {}, Size: {}",
        pageable.getPageNumber(),
        pageable.getPageSize());
    try {
      Page<OrderItemsDTO> sipOrderItems =
          orderItemsRepository.findAllSipOrderItems(pageable).map(OrderItemsDTO::fromEntity);
      log.info(
          "Successfully retrieved {} SIP Order Items (Total: {})",
          sipOrderItems.getContent().size(),
          sipOrderItems.getTotalElements());
      return sipOrderItems;
    } catch (Exception e) {
      log.error("Error retrieving paginated SIP Order Items: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to retrieve paginated SIP Order Items", e);
    }
  }

  /**
   * Retrieves fund allocation percentages for given orders
   *
   * @param ordersParam Comma-separated list of order IDs
   * @return List of OrderAllocationProjection containing fund names and allocation percentages
   */
  public List<OrderAllocationProjection> getAllocationByOrders(String ordersParam) {
    log.info("Fetching allocation for orders: {}", ordersParam);

    try {
      // Get current user from context
      var user = userContext.getUser();
      if (user == null) {
        log.warn("No user found in context");
        return Collections.emptyList();
      }

      // Parse order IDs from comma-separated string
      List<Long> orderIds =
          Arrays.stream(ordersParam.split(","))
              .map(String::trim)
              .filter(s -> !s.isEmpty())
              .map(Long::parseLong)
              .collect(Collectors.toList());

      if (orderIds.isEmpty()) {
        log.warn("No valid order IDs provided");
        return Collections.emptyList();
      }

      log.info("Querying allocations for {} orders for user {}", orderIds.size(), user.getId());
      List<OrderAllocationProjection> allocations =
          orderItemsRepository.findAllocationByOrderIds(orderIds, user.getId());

      log.info("Successfully retrieved {} fund allocations", allocations.size());
      return allocations;

    } catch (NumberFormatException e) {
      log.error("Invalid order ID format in: {}", ordersParam, e);
      return Collections.emptyList();
    } catch (Exception e) {
      log.error("Error retrieving allocations: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to retrieve order allocations", e);
    }
  }
}
