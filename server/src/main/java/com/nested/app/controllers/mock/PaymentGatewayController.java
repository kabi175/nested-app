package com.nested.app.controllers.mock;

import com.nested.app.services.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
@Profile("dev")
@RequiredArgsConstructor
public class PaymentGatewayController {
  private final PaymentService paymentService;

  @GetMapping("/public/payment/{payment_id}")
  public String page(Model model) {
    model.addAttribute("name", "Kabilan");
    return "payment-dev"; // refers to templates/index.html
  }

  @PostMapping("/public/payment/{payment_ref}/success")
  public ResponseEntity<?> markSuccess(@PathVariable("payment_ref") String paymentRef) {
    paymentService.markPaymentSuccess(paymentRef);
    return ResponseEntity.ok().build();
  }

  @PostMapping("/public/payment/{payment_ref}/failure")
  public ResponseEntity<?> markFailure(@PathVariable("payment_ref") String paymentRef) {
    paymentService.markPaymentFailure(paymentRef);
    return ResponseEntity.ok().build();
  }
}
