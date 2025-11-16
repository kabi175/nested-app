package com.nested.app.controllers;

import com.nested.app.dto.PlaceOrderDTO;
import com.nested.app.dto.PlaceOrderPostDTO;
import com.nested.app.dto.VerifyOrderDTO;
import com.nested.app.services.BuyOrderPaymentService;
import com.nested.app.services.PaymentService;
import com.nested.app.services.SipOrderPaymentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
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
  private final BuyOrderPaymentService buyOrderPaymentService;
  private final SipOrderPaymentService sipOrderPaymentService;

  @PostMapping
  public ResponseEntity<?> placeOrders(@Valid @RequestBody PlaceOrderPostDTO placeOrderRequest) {
    PlaceOrderDTO paymentWithOrder = paymentService.createPaymentWithOrders(placeOrderRequest);
    return ResponseEntity.status(HttpStatus.CREATED).body(paymentWithOrder);
  }

  // Buy Order Payment Endpoints
  @PostMapping("{payment_id}/buy/actions/verify")
  public ResponseEntity<?> verifyBuyOrder(@Valid @RequestBody VerifyOrderDTO verifyOrderRequest) {
    log.info("Verifying buy order payment for payment ID: {}", verifyOrderRequest.getId());
    PlaceOrderDTO verifiedPayment =
        buyOrderPaymentService.verifyBuyOrderPayment(verifyOrderRequest);
    return ResponseEntity.ok(verifiedPayment);
  }

  @PostMapping("{payment_id}/buy/actions/fetch_redirect_url")
  public ResponseEntity<?> initiateBuyOrderPayment(@PathVariable("payment_id") Long paymentID) {
    log.info("Fetching buy order payment redirect URL for payment ID: {}", paymentID);
    var payment = buyOrderPaymentService.fetchBuyOrderPaymentUrl(paymentID);
    return ResponseEntity.ok(payment);
  }

  // SIP Order Payment Endpoints
  @PostMapping("{payment_id}/sip/actions/verify")
  public ResponseEntity<?> verifySipOrder(@Valid @RequestBody VerifyOrderDTO verifyOrderRequest) {
    log.info("Verifying SIP order payment for payment ID: {}", verifyOrderRequest.getId());
    PlaceOrderDTO verifiedPayment =
        sipOrderPaymentService.verifySipOrderPayment(verifyOrderRequest);
    return ResponseEntity.ok(verifiedPayment);
  }

  @PostMapping("{payment_id}/sip/actions/fetch_redirect_url")
  public ResponseEntity<?> initiateSipOrderPayment(@PathVariable("payment_id") Long paymentID) {
    log.info("Fetching SIP order payment redirect URL for payment ID: {}", paymentID);
    var payment = sipOrderPaymentService.fetchSipOrderPaymentUrl(paymentID);
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
