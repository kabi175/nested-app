package com.nested.app.controllers;

import com.nested.app.dto.Entity;
import com.nested.app.dto.OrderItemsDTO;
import com.nested.app.services.OrderItemsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for managing OrderItems Provides endpoints for retrieving order items information
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/order-items")
@RequiredArgsConstructor
@Tag(name = "OrderItems", description = "API endpoints for managing order items")
public class OrderItemsController {

  private final OrderItemsService orderItemsService;

  /**
   * Retrieves all SIP Order Items
   *
   * @return ResponseEntity containing list of SIP order items
   */
  @GetMapping("/sip")
  @Operation(
      summary = "Get all SIP Order Items",
      description = "Retrieves all order items associated with SIP orders")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved SIP order items",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> getAllSipOrderItems() {
    log.info("GET /api/v1/order-items/sip - Retrieving all SIP order items");

    try {
      List<OrderItemsDTO> sipOrderItems = orderItemsService.getAllSipOrderItems();
      log.info("Successfully retrieved {} SIP order items", sipOrderItems.size());
      return ResponseEntity.ok(Entity.of(sipOrderItems));
    } catch (Exception e) {
      log.error("Error retrieving SIP order items: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "Failed to retrieve SIP order items"));
    }
  }
}
