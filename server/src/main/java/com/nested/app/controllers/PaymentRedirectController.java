package com.nested.app.controllers;

import com.nested.app.services.PaymentRedirectService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequestMapping("/redirects")
@RequiredArgsConstructor
@Tag(name = "payment-redirect", description = "payment redirect handler")
public class PaymentRedirectController {
  private final PaymentRedirectService paymentRedirectService;

  @PostMapping("/mandate/{mandate_id}")
  public ResponseEntity<?> mandateRedirectHandler(@PathVariable("mandate_id") Long mandateID) {
    return paymentRedirectService.handleMandateRedirect(mandateID);
  }

  @PostMapping("/payment/{payment_id}")
  public ResponseEntity<?> paymentRedirectHandler(@PathVariable("payment_id") Long paymentID) {
    return paymentRedirectService.handlePaymentRedirect(paymentID);
  }
}
