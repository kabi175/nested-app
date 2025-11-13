package com.nested.app.controllers;

import com.nested.app.services.KycRedirectService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequestMapping("/redirects/kyc/{kyc_request_id}")
@RequiredArgsConstructor
@Tag(name = "kyc-redirect", description = "endpoints for KYC redirect handling")
public class KycRedirectController {

  private final KycRedirectService kycRedirectService;

  @GetMapping("/aadhaar_upload")
  ResponseEntity<?> handleAadhaarRedirect(@PathVariable("kyc_request_id") String kycRequestId) {
    log.info("Handling Aadhaar upload redirect for KYC request ID: {}", kycRequestId);
    kycRedirectService.handleAadhaarUploadRedirect(kycRequestId);
    return ResponseEntity.ok().build();
  }

  @GetMapping("/esign")
  ResponseEntity<?> handleESignRedirect(@PathVariable("kyc_request_id") String kycRequestId) {
    log.info("Handling eSign redirect for KYC request ID: {}", kycRequestId);
    kycRedirectService.handleESignRedirect(kycRequestId);
    return ResponseEntity.ok().build();
  }
}
