package com.nested.app.controllers;

import com.nested.app.dto.MfaStartRequest;
import com.nested.app.dto.MfaStartResponse;
import com.nested.app.dto.MfaVerifyRequest;
import com.nested.app.dto.MfaVerifyResponse;
import com.nested.app.services.MfaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth/mfa")
@RequiredArgsConstructor
@Tag(name = "MFA", description = "Multi-Factor Authentication endpoints")
public class MfaController {

  private final MfaService mfaService;

  @PostMapping("/start")
  @Operation(
      summary = "Start MFA session",
      description = "Initiates an MFA session by generating and sending an OTP via SMS or WhatsApp")
  @ApiResponses({
    @ApiResponse(
        responseCode = "200",
        description = "MFA session started successfully",
        content = @Content(schema = @Schema(implementation = MfaStartResponse.class))),
    @ApiResponse(responseCode = "400", description = "Invalid request"),
    @ApiResponse(responseCode = "401", description = "Unauthorized"),
    @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public ResponseEntity<MfaStartResponse> startMfa(
      @Valid @RequestBody MfaStartRequest request, HttpServletRequest httpRequest) {
    String userId = getCurrentUserId();
    log.info(
        "Starting MFA session: userId={}, action={}, channel={}",
        userId,
        request.getAction(),
        request.getChannel());

    UUID sessionId =
        mfaService.startMfaSession(
            userId, request.getAction(), request.getChannel(), httpRequest, request.getEmail());

    MfaStartResponse response = new MfaStartResponse(sessionId, "OTP sent successfully");
    return ResponseEntity.ok(response);
  }

  @PostMapping("/verify")
  @Operation(
      summary = "Verify MFA OTP",
      description = "Verifies the OTP and returns an MFA token for authenticated requests")
  @ApiResponses({
    @ApiResponse(
        responseCode = "200",
        description = "OTP verified successfully",
        content = @Content(schema = @Schema(implementation = MfaVerifyResponse.class))),
    @ApiResponse(responseCode = "400", description = "Invalid OTP"),
    @ApiResponse(responseCode = "401", description = "Unauthorized"),
    @ApiResponse(responseCode = "403", description = "MFA verification failed"),
    @ApiResponse(responseCode = "500", description = "Internal server error")
  })
  public ResponseEntity<MfaVerifyResponse> verifyMfa(
      @Valid @RequestBody MfaVerifyRequest request, HttpServletRequest httpRequest) {
    String userId = getCurrentUserId();
    log.info("Verifying MFA OTP: userId={}, sessionId={}", userId, request.getMfaSessionId());

    String mfaToken =
        mfaService.verifyOtp(userId, request.getMfaSessionId(), request.getOtp(), httpRequest);

    MfaVerifyResponse response = new MfaVerifyResponse(mfaToken, "MFA verification successful");
    return ResponseEntity.ok(response);
  }

  /**
   * Gets the current authenticated user's Firebase UID
   *
   * @return Firebase UID
   */
  private String getCurrentUserId() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication == null || authentication.getPrincipal() == null) {
      throw new RuntimeException("User not authenticated");
    }
    return authentication.getPrincipal().toString();
  }
}
