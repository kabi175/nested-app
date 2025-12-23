package com.nested.app.controllers;

import com.nested.app.contect.UserContext;
import com.nested.app.dto.Entity;
import com.nested.app.dto.OrderAllocationProjection;
import com.nested.app.dto.OrderDTO;
import com.nested.app.dto.OrderRequestDTO;
import com.nested.app.services.OrderItemsService;
import com.nested.app.services.OrderService;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@Tag(name = "Order")
public class OrderController {
  private final OrderService orderService;
  private final OrderItemsService orderItemsService;
  private final UserContext userContext;

  @PostMapping
  public ResponseEntity<?> createOrders(@RequestBody OrderRequestDTO requestBody) {

    List<OrderDTO> createdOrders = orderService.placeOrder(requestBody, userContext.getUser());

    return ResponseEntity.status(HttpStatus.CREATED).body(Entity.of(createdOrders));
  }

  @GetMapping("/allocation")
  public ResponseEntity<?> getAllocation(@RequestParam("orders") String orders) {
    log.info("GET /api/v1/orders/allocation - orders: {}", orders);

    List<OrderAllocationProjection> allocations =
        orderItemsService.getAllocationByOrders(orders, userContext.getUser());

    return ResponseEntity.ok(Entity.of(allocations));
  }
}
