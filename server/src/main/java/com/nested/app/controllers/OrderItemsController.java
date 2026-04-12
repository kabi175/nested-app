package com.nested.app.controllers;

import com.nested.app.dto.OrderItemsDTO;
import com.nested.app.dto.SipCancelRequest;
import com.nested.app.dto.SipModifyRequest;
import com.nested.app.services.OrderItemsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
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
      description =
          "Retrieves all order items associated with SIP orders with optional pagination support")
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
  public ResponseEntity<?> getAllSipOrderItems(
      @Parameter(description = "Pagination parameters (page, size, sort)")
          @PageableDefault(size = 20, page = 0)
          Pageable pageable) {
    log.info(
        "GET /api/v1/order-items/sip - Retrieving SIP order items with pagination - Page: {}, Size: {}",
        pageable.getPageNumber(),
        pageable.getPageSize());

    try {
      Page<OrderItemsDTO> sipOrderItemsPage = orderItemsService.getSipOrderItems(pageable);
      log.info(
          "Successfully retrieved {} SIP order items (Total: {})",
          sipOrderItemsPage.getContent().size(),
          sipOrderItemsPage.getTotalElements());
      return ResponseEntity.ok(
          Map.of(
              "data",
              sipOrderItemsPage.getContent(),
              "pagination",
              Map.of(
                  "page",
                  pageable.getPageNumber(),
                  "size",
                  pageable.getPageSize(),
                  "totalPages",
                  sipOrderItemsPage.getTotalPages(),
                  "totalElements",
                  sipOrderItemsPage.getTotalElements(),
                  "hasNext",
                  sipOrderItemsPage.hasNext(),
                  "hasPrevious",
                  sipOrderItemsPage.hasPrevious())));
    } catch (Exception e) {
      log.error("Error retrieving SIP order items: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "Failed to retrieve SIP order items"));
    }
  }

  @PostMapping("/sip/{sipOrderId}/actions/cancel")
  @Operation(summary = "Cancel a SIP order", description = "Cancels the SIP plan at the provider and marks it as cancelled locally")
  public ResponseEntity<?> cancelSipOrder(
      @PathVariable Long sipOrderId,
      @RequestBody SipCancelRequest request) {
    log.info("POST /api/v1/order-items/sip/{}/actions/cancel - code={}", sipOrderId, request.getCancellationCode());
    try {
      orderItemsService.cancelSipOrder(sipOrderId, request.getCancellationCode(), request.getCancellationReason());
      return ResponseEntity.ok(Map.of("message", "SIP cancelled successfully"));
    } catch (RuntimeException e) {
      log.error("Error cancelling SIP order id={}: {}", sipOrderId, e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "Failed to cancel SIP order"));
    }
  }

  @PostMapping("/sip/{sipOrderId}/actions/modify")
  @Operation(
      summary = "Modify SIP order amount",
      description =
          "Submits a modification request to update the SIP total amount."
              + " Returns 409 if a previous modification is still pending.")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Modification submitted successfully"),
        @ApiResponse(responseCode = "409", description = "A previous modification is still pending"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> modifySipOrder(
      @PathVariable Long sipOrderId,
      @RequestBody SipModifyRequest request) {
    log.info("POST /api/v1/order-items/sip/{}/actions/modify - amount={}", sipOrderId, request.getAmount());
    try {
      String mandateUrl = orderItemsService.modifySipOrder(sipOrderId, request.getAmount());
      if (mandateUrl != null) {
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of("mandate_url", mandateUrl));
      }
      return ResponseEntity.ok(Map.of("message", "SIP modification submitted"));
    } catch (IllegalStateException e) {
      log.warn("SIP modification conflict for id={}: {}", sipOrderId, e.getMessage());
      return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
    } catch (RuntimeException e) {
      log.error("Error modifying SIP order id={}: {}", sipOrderId, e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "Failed to submit SIP modification"));
    }
  }
}
