package com.nested.app.controllers;

import com.nested.app.annotation.RequiresMfa;
import com.nested.app.contect.UserContext;
import com.nested.app.dto.Entity;
import com.nested.app.dto.OrderDTO;
import com.nested.app.dto.SellOrderRequestDTO;
import com.nested.app.dto.SellOrderVerifyDTO;
import com.nested.app.services.SellOrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for managing sell orders Provides endpoints for placing and verifying sell orders
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/sell-orders")
@RequiredArgsConstructor
@Tag(name = "Sell Order", description = "API endpoints for managing sell orders")
public class SellOrderController {
  private final SellOrderService sellOrderService;
  private final UserContext userContext;

  /**
   * Place new sell orders Validates available holdings, auto-selects folios, and places orders via
   * external API
   *
   * @param requestBody Sell order request containing order details
   * @return List of created sell orders
   */
  @PostMapping
  public ResponseEntity<?> createSellOrders(@Valid @RequestBody SellOrderRequestDTO requestBody) {
    log.info(
        "Received request to create sell orders with {} items", requestBody.getSellOrders().size());

    List<OrderDTO> createdOrders =
        sellOrderService.placeSellOrder(requestBody, userContext.getUser());

    log.info("Successfully created {} sell orders", createdOrders.size());
    return ResponseEntity.status(HttpStatus.CREATED).body(Entity.of(createdOrders));
  }

  /**
   * Verify and confirm sell orders Updates consent and confirms orders with external API, then
   * schedules fulfillment jobs Email and mobile are automatically obtained from the authenticated
   * user's profile
   *
   * @param verifyRequest Verification request with order IDs only
   * @return Success response
   */
  @RequiresMfa(action = "MF_SELL")
  @PostMapping("/verify")
  public ResponseEntity<?> verifySellOrders(@Valid @RequestBody SellOrderVerifyDTO verifyRequest) {
    log.info("Received request to verify {} sell orders", verifyRequest.getOrderIds().size());

    sellOrderService.verifySellOrder(verifyRequest, userContext.getUser());

    log.info("Successfully verified {} sell orders", verifyRequest.getOrderIds().size());
    return ResponseEntity.ok()
        .body(java.util.Map.of("message", "Sell orders verified successfully"));
  }
}
