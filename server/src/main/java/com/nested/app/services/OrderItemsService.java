package com.nested.app.services;

import com.nested.app.dto.OrderItemsDTO;
import com.nested.app.repository.OrderItemsRepository;
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
}
