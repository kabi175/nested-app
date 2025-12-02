package com.nested.app.services;

import com.nested.app.dto.OrderItemsDTO;
import com.nested.app.repository.OrderItemsRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

  /**
   * Retrieves all SIP Order Items
   *
   * @return List of OrderItemsDTO containing all SIP order items
   */
  public List<OrderItemsDTO> getAllSipOrderItems() {
    log.info("Fetching all SIP Order Items");
    try {
      List<OrderItemsDTO> sipOrderItems =
          orderItemsRepository.findAllSipOrderItems().stream()
              .map(OrderItemsDTO::fromEntity)
              .toList();
      log.info("Successfully retrieved {} SIP Order Items", sipOrderItems.size());
      return sipOrderItems;
    } catch (Exception e) {
      log.error("Error retrieving SIP Order Items: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to retrieve SIP Order Items", e);
    }
  }
}
