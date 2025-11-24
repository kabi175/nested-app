package com.nested.app.controllers;

import com.nested.app.services.PaymentRedirectService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequestMapping("/redirects")
@RequiredArgsConstructor
@Tag(name = "payment-redirect", description = "payment redirect handler")
public class PaymentRedirectController {
  private final PaymentRedirectService paymentRedirectService;

  @GetMapping("/mandate/{mandate_id}")
  public void mandateRedirectHandler(@PathVariable("mandate_id") Long mandateID) {
    paymentRedirectService.handleMandateRedirect(mandateID);
  }

  @GetMapping("/payment/{payment_ref}")
  public void paymentRedirectHandler(@PathVariable("payment_ref") String paymentRef) {
    paymentRedirectService.handlePaymentRedirect(paymentRef);
  }
}
