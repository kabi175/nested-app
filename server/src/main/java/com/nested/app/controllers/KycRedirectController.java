package com.nested.app.controllers;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequestMapping("/redirects/kyc/{kyc_request_id}")
@RequiredArgsConstructor
@Tag(name = "kyc-redirect", description = "endpoints for KYC redirect handling")
public class KycRedirectController {

  @GetMapping("/aadhaar_upload")
  ResponseEntity<?> handleAadhaarRedirect() {
    log.info("Handling KYC redirect");
    return ResponseEntity.ok().build();
  }

  @GetMapping("/esign")
  ResponseEntity<?> handleESignRedirect() {
    log.info("Handling eSign redirect");
    return ResponseEntity.ok().build();
  }
}
