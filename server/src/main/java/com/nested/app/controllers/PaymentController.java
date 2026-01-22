package com.nested.app.controllers;

import com.nested.app.annotation.RequiresMfa;
import com.nested.app.context.UserContext;
import com.nested.app.dto.PaymentDTO;
import com.nested.app.dto.PlaceOrderDTO;
import com.nested.app.dto.PlaceOrderPostDTO;
import com.nested.app.dto.VerifyOrderDTO;
import com.nested.app.services.BuyOrderPaymentService;
import com.nested.app.services.PaymentService;
import com.nested.app.services.SipOrderPaymentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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
  private final UserContext userContext;

  @PostMapping
  public ResponseEntity<?> placeOrders(@Valid @RequestBody PlaceOrderPostDTO placeOrderRequest) {
    PlaceOrderDTO paymentWithOrder =
        paymentService.createPaymentWithOrders(placeOrderRequest, userContext.getUser());
    return ResponseEntity.status(HttpStatus.CREATED).body(paymentWithOrder);
  }

  @GetMapping("/{id}")
  public ResponseEntity<PaymentDTO> getPaymentById(@PathVariable("id") Long id) {
    log.info("Fetching payment with ID: {}", id);
    PaymentDTO payment = paymentService.getPaymentById(id);
    return ResponseEntity.ok(payment);
  }

  // Buy Order Payment Endpoints
  @RequiresMfa(action = "MF_BUY")
  @PostMapping("{payment_id}/actions/verify")
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

  @PostMapping("{payment_id}/sip/actions/fetch_redirect_url")
  public ResponseEntity<?> initiateSipOrderPayment(@PathVariable("payment_id") Long paymentID) {
    log.info("Fetching SIP order payment redirect URL for payment ID: {}", paymentID);
    var payment = sipOrderPaymentService.fetchSipOrderPaymentUrl(paymentID);
    return ResponseEntity.ok(payment);
  }
}
