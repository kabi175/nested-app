package com.nested.app.controllers;

import com.nested.app.dto.Entity;
import com.nested.app.dto.PlaceOrderDTO;
import com.nested.app.dto.PlaceOrderPostDTO;
import com.nested.app.dto.VerifyOrderDTO;
import com.nested.app.services.PaymentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Tag(name = "Payment", description = "API endpoints for managing payments")
public class PaymentController {
  private final PaymentService paymentService;

  @PostMapping
  public ResponseEntity<?> placeOrders(@Valid @RequestBody PlaceOrderPostDTO placeOrderRequest) {
    PlaceOrderDTO paymentWithOrders = paymentService.createPaymentWithOrders(placeOrderRequest);
    return ResponseEntity.status(HttpStatus.CREATED).body(Entity.of(List.of(paymentWithOrders)));
  }

  @PostMapping("{payment_id}/actions/verify")
  public ResponseEntity<?> verifyOrder(@Valid @RequestBody VerifyOrderDTO verifyOrderRequest) {
    PlaceOrderDTO verifiedPayment = paymentService.verifyPayment(verifyOrderRequest);
    return ResponseEntity.ok(verifiedPayment);
  }

  @PostMapping("{payment_id}/actions/iniate")
  public ResponseEntity<?> initiatePayment(
      @PathVariable("payment_id") Long paymentID, HttpServletRequest request) {
    var payment = paymentService.iniatePayment(paymentID, getIpAddress(request));
    return ResponseEntity.ok(payment);
  }

  private String getIpAddress(HttpServletRequest request) {
    String ipAddress = request.getHeader("X-Forwarded-For");
    if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
      ipAddress = request.getRemoteAddr();
    }
    // If X-Forwarded-For contains multiple IPs (e.g., "client, proxy1, proxy2"),
    // the first one is typically the actual client IP.
    if (ipAddress != null && ipAddress.contains(",")) {
      ipAddress = ipAddress.split(",")[0].trim();
    }
    return ipAddress;
  }
}
