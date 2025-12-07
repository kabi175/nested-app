package com.nested.app.controllers;

import com.nested.app.services.PaymentRedirectService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
  public String mandateRedirectHandler(@PathVariable("mandate_id") Long mandateID) {
    return paymentRedirectService.handleMandateRedirect(mandateID);
  }

  @PostMapping("/payment/{payment_id}")
  public String paymentRedirectHandler(@PathVariable("payment_id") Long paymentID) {
    paymentRedirectService.handlePaymentRedirect(paymentID);
    return "redirect:nested://payment/" + paymentID + "/success?type=buy";
  }
}
