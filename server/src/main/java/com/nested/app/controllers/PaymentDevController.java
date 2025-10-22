package com.nested.app.controllers;

import com.nested.app.services.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@Profile("dev")
@RequiredArgsConstructor
public class PaymentDevController {
  private PaymentService paymentService;

  @GetMapping("/public/payment/{payment_id}")
  public String page(Model model) {
    model.addAttribute("name", "Kabilan");
    return "payment-dev"; // refers to templates/index.html
  }

  @PostMapping("/public/payment/{payment_id}/success")
  public ResponseEntity<?> markSuccess(@RequestParam("payment_id") Long paymentID) {
    paymentService.markPaymentSuccess(paymentID);
    return ResponseEntity.ok().build();
  }

  @PostMapping("/public/payment/{payment_id}/failure")
  public ResponseEntity<?> markFailure(@RequestParam("payment_id") Long paymentID) {
    paymentService.markPaymentFailure(paymentID);
    return ResponseEntity.ok().build();
  }
}
