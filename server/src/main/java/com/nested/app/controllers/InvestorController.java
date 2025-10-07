package com.nested.app.controllers;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.nested.app.client.tarrakki.dto.NomineeRequest;
import com.nested.app.client.tarrakki.dto.OtpResponse;
import com.nested.app.services.InvestorServiceImpl;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST Controller for managing Investor operations
 * Provides endpoints for bank accounts, documents, and nominees
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/investors")
@RequiredArgsConstructor
@Tag(name = "Investor Management", description = "APIs for managing investor operations")
public class InvestorController {

  private final InvestorServiceImpl investorService;

  @PostMapping(value = "/{investor_id}/banks", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(
      summary = "Add bank account for investor",
      description = "Adds a bank account to investor profile in Tarrakki")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "Bank account added successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data or missing required fields"),
        @ApiResponse(responseCode = "404", description = "Investor not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> addBankAccount(
      @Parameter(description = "Investor ID", required = true) @PathVariable("investor_id")
          Long investorId,
      @Parameter(description = "Account type (savings/current)", required = true)
          @RequestParam("account_type")
          String accountType,
      @Parameter(description = "Bank account number", required = true)
          @RequestParam("account_number")
          String accountNumber,
      @Parameter(description = "IFSC code", required = true) @RequestParam("ifsc") String ifsc,
      @Parameter(description = "Verification document type (e.g., cancelled_cheque)", required = true)
          @RequestParam("verification_document")
          String verificationDocument,
      @Parameter(description = "Verification document file", required = true) @RequestParam("file")
          MultipartFile file) {

    log.info(
        "POST /api/v1/investors/{}/banks - Adding bank account for investor", investorId);

    try {
      String bankId =
          investorService.addBankAccount(
              investorId, accountType, accountNumber, ifsc, verificationDocument, file);

      log.info(
          "Successfully added bank account for investor ID: {} with bank_id: {}",
          investorId,
          bankId);

      return ResponseEntity.status(HttpStatus.CREATED)
          .body(Map.of("message", "Bank account added successfully", "bank_id", bankId));

    } catch (IllegalArgumentException e) {
      log.warn("Validation error adding bank account for investor {}: {}", investorId, e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", e.getMessage()));
    } catch (IllegalStateException e) {
      log.warn("State error adding bank account for investor {}: {}", investorId, e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      log.error("Error adding bank account for investor {}: {}", investorId, e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "Failed to add bank account: " + e.getMessage()));
    }
  }

  @PostMapping(value = "/{investor_id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(
      summary = "Upload document for investor",
      description = "Uploads a document (signature, photo, etc.) to investor profile in Tarrakki")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "Document uploaded successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data or missing required fields"),
        @ApiResponse(responseCode = "404", description = "Investor not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> uploadDocument(
      @Parameter(description = "Investor ID", required = true) @PathVariable("investor_id")
          Long investorId,
      @Parameter(description = "Document type (signature, photo, etc.)", required = true)
          @RequestParam("document_type")
          String documentType,
      @Parameter(description = "Document file", required = true) @RequestParam("file")
          MultipartFile file) {

    log.info("POST /api/v1/investors/{}/documents - Uploading document for investor", investorId);

    try {
      investorService.uploadDocument(investorId, documentType, file);

      log.info("Successfully uploaded document for investor ID: {}", investorId);

      return ResponseEntity.status(HttpStatus.CREATED)
          .body(Map.of("message", "Document uploaded successfully"));

    } catch (IllegalArgumentException e) {
      log.warn("Validation error uploading document for investor {}: {}", investorId, e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", e.getMessage()));
    } catch (IllegalStateException e) {
      log.warn("State error uploading document for investor {}: {}", investorId, e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      log.error("Error uploading document for investor {}: {}", investorId, e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "Failed to upload document: " + e.getMessage()));
    }
  }

  @PostMapping("/{investor_id}/nominees/otp/send")
  @Operation(
      summary = "Send OTP for nominee addition",
      description = "Sends OTP to investor's registered mobile/email for nominee addition")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "OTP sent successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "404", description = "Investor not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> sendNomineeOtp(
      @Parameter(description = "Investor ID", required = true) @PathVariable("investor_id")
          Long investorId) {

    log.info("POST /api/v1/investors/{}/nominees/otp/send - Sending nominee OTP", investorId);

    try {
      OtpResponse otpResponse = investorService.sendNomineeOtp(investorId);

      log.info(
          "Successfully sent nominee OTP for investor ID: {} with otp_id: {}",
          investorId,
          otpResponse.getOtp_id());

      return ResponseEntity.ok(
          Map.of(
              "message",
              "OTP sent successfully",
              "otp_id",
              otpResponse.getOtp_id(),
              "email",
              otpResponse.getEmail(),
              "mobile",
              otpResponse.getMobile(),
              "expiry",
              otpResponse.getExpiry()));

    } catch (IllegalArgumentException e) {
      log.warn("Validation error sending nominee OTP for investor {}: {}", investorId, e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", e.getMessage()));
    } catch (IllegalStateException e) {
      log.warn("State error sending nominee OTP for investor {}: {}", investorId, e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      log.error("Error sending nominee OTP for investor {}: {}", investorId, e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "Failed to send OTP: " + e.getMessage()));
    }
  }

  @PostMapping("/{investor_id}/nominees/otp/verify")
  @Operation(
      summary = "Verify OTP for nominee addition",
      description = "Verifies the OTP sent for nominee addition")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "OTP verified successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "400", description = "Invalid or expired OTP"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> verifyNomineeOtp(
      @Parameter(description = "Investor ID", required = true) @PathVariable("investor_id")
          Long investorId,
      @Parameter(description = "OTP ID from send OTP response", required = true)
          @RequestParam("otp_id")
          String otpId,
      @Parameter(description = "OTP code", required = true) @RequestParam("otp") String otp) {

    log.info("POST /api/v1/investors/{}/nominees/otp/verify - Verifying nominee OTP", investorId);

    try {
      boolean isValid = investorService.verifyNomineeOtp(otpId, otp);

      if (isValid) {
        log.info("Successfully verified nominee OTP for investor ID: {}", investorId);
        return ResponseEntity.ok(Map.of("message", "OTP verified successfully", "valid", true));
      } else {
        log.warn("Invalid OTP for investor ID: {}", investorId);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
            .body(Map.of("message", "Invalid or expired OTP", "valid", false));
      }

    } catch (Exception e) {
      log.error("Error verifying nominee OTP for investor {}: {}", investorId, e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "Failed to verify OTP: " + e.getMessage()));
    }
  }

  @PostMapping("/{investor_id}/nominees")
  @Operation(
      summary = "Add nominees for investor",
      description = "Adds nominees to investor profile after OTP verification")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "Nominees added successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Investor not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> addNominees(
      @Parameter(description = "Investor ID", required = true) @PathVariable("investor_id")
          Long investorId,
      @Parameter(description = "OTP ID from verification", required = true) @RequestParam("otp_id")
          String otpId,
      @Parameter(description = "Nominee request with nominees list", required = true) @Valid
          @RequestBody
          NomineeRequest nomineeRequest) {

    log.info("POST /api/v1/investors/{}/nominees - Adding nominees for investor", investorId);

    try {
      String nomineeId = investorService.addNominees(investorId, otpId, nomineeRequest);

      log.info(
          "Successfully added nominees for investor ID: {} with nominee_id: {}",
          investorId,
          nomineeId);

      return ResponseEntity.status(HttpStatus.CREATED)
          .body(Map.of("message", "Nominees added successfully", "nominee_id", nomineeId));

    } catch (IllegalArgumentException e) {
      log.warn("Validation error adding nominees for investor {}: {}", investorId, e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", e.getMessage()));
    } catch (IllegalStateException e) {
      log.warn("State error adding nominees for investor {}: {}", investorId, e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      log.error("Error adding nominees for investor {}: {}", investorId, e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "Failed to add nominees: " + e.getMessage()));
    }
  }
}

