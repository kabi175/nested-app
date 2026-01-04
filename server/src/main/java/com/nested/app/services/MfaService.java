package com.nested.app.services;

import com.nested.app.entity.MfaAttempt;
import com.nested.app.entity.MfaSession;
import com.nested.app.entity.User;
import com.nested.app.enums.MfaChannel;
import com.nested.app.enums.MfaStatus;
import com.nested.app.exception.MfaException;
import com.nested.app.repository.MfaAttemptRepository;
import com.nested.app.repository.MfaSessionRepository;
import com.nested.app.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class MfaService {

  private static final String HMAC_ALGORITHM = "HmacSHA256";
  private final OtpService otpService;
  private final TwilioService twilioService;
  private final MfaSessionRepository mfaSessionRepository;
  private final MfaAttemptRepository mfaAttemptRepository;
  private final UserRepository userRepository;
  @Value("${mfa.otp.expiry-seconds:60}")
  private int otpExpirySeconds;
  @Value("${mfa.token.expiry-seconds:300}")
  private int mfaTokenExpirySeconds;
  @Value("${mfa.max-attempts:3}")
  private int maxAttempts;
  @Value("${mfa.token.secret:change-me-in-production}")
  private String mfaTokenSecret;
  @Value("${mfa.mock.enabled:false}")
  private boolean mockEnabled;
  @Value("${mfa.mock.otp:123456}")
  private String mockOtp;

  /**
   * Starts an MFA session by generating OTP, hashing it, storing it, and sending via Twilio
   *
   * @param userId Firebase user ID
   * @param action Action requiring MFA (e.g., "MF_BUY")
   * @param channel SMS or WHATSAPP
   * @param request HTTP request for IP and user-agent
   * @return MFA session ID
   */
  @Transactional
  public UUID startMfaSession(
      String userId, String action, MfaChannel channel, HttpServletRequest request) {
    // Get user phone number
    Optional<User> userOpt = userRepository.findByFirebaseUid(userId);
    if (userOpt.isEmpty() || userOpt.get().getPhoneNumber() == null) {
      throw new MfaException("User phone number not found");
    }

    String phoneNumber = userOpt.get().getPhoneNumber();
    String maskedDestination = maskPhoneNumber(phoneNumber);

    // Generate OTP (use mock OTP if mock mode is enabled)
    String otp;
    if (mockEnabled) {
      otp = mockOtp;
      log.warn(
          "MOCK MODE ENABLED: Using fixed OTP for MFA. This should only be used in development!");
    } else {
      otp = otpService.generateOtp();
    }
    String otpHash = otpService.hashOtp(otp);

    // Calculate expiry
    Timestamp otpExpiresAt = Timestamp.from(Instant.now().plusSeconds(otpExpirySeconds));

    // Create session
    MfaSession session =
        MfaSession.builder()
            .userId(userId)
            .action(action)
            .channel(channel)
            .destination(maskedDestination)
            .otpHash(otpHash)
            .otpExpiresAt(otpExpiresAt)
            .maxAttempts((short) maxAttempts)
            .attempts((short) 0)
            .status(MfaStatus.PENDING)
            .ipAddress(getClientIpAddress(request))
            .userAgent(request.getHeader("User-Agent"))
            .build();

    session = mfaSessionRepository.save(session);

    // Send OTP via Twilio (skip in mock mode)
    if (mockEnabled) {
      log.info(
          "MOCK MODE: MFA session started without sending OTP. Use OTP '{}' for verification. sessionId={}, userId={}, action={}, channel={}",
          mockOtp,
          session.getId(),
          userId,
          action,
          channel);
    } else {
      try {
        twilioService.sendOtp(phoneNumber, otp, channel);
        log.info(
            "MFA session started: sessionId={}, userId={}, action={}, channel={}",
            session.getId(),
            userId,
            action,
            channel);
      } catch (Exception e) {
        log.error("Failed to send OTP for session {}: {}", session.getId(), e.getMessage(), e);
        session.setStatus(MfaStatus.FAILED);
        mfaSessionRepository.save(session);
        throw new MfaException("Failed to send OTP", e);
      }
    }

    return session.getId();
  }

  /**
   * Verifies OTP and issues MFA token on success
   *
   * @param userId Firebase user ID
   * @param sessionId MFA session ID
   * @param otp OTP to verify
   * @param request HTTP request for IP and user-agent
   * @return MFA token
   */
  @Transactional
  public String verifyOtp(String userId, UUID sessionId, String otp, HttpServletRequest request) {
    // Find session
    Optional<MfaSession> sessionOpt = mfaSessionRepository.findByIdAndUserId(sessionId, userId);
    if (sessionOpt.isEmpty()) {
      log.warn("MFA session not found: sessionId={}, userId={}", sessionId, userId);
      throw new MfaException("Invalid MFA session");
    }

    MfaSession session = sessionOpt.get();

    // Check session status
    if (session.getStatus() != MfaStatus.PENDING) {
      log.warn(
          "MFA session not in PENDING status: sessionId={}, status={}",
          sessionId,
          session.getStatus());
      throw new MfaException("session expired");
    }

    // Check if expired
    if (session.getOtpExpiresAt().before(Timestamp.from(Instant.now()))) {
      session.setStatus(MfaStatus.EXPIRED);
      mfaSessionRepository.save(session);
      log.warn("MFA session expired: sessionId={}", sessionId);
      throw new MfaException("OTP has expired");
    }

    // Check max attempts
    if (session.getAttempts() >= session.getMaxAttempts()) {
      session.setStatus(MfaStatus.FAILED);
      mfaSessionRepository.save(session);
      log.warn(
          "MFA session exceeded max attempts: sessionId={}, attempts={}",
          sessionId,
          session.getAttempts());
      throw new MfaException("Maximum verification attempts exceeded");
    }

    // Record attempt
    MfaAttempt attempt =
        MfaAttempt.builder()
            .mfaSession(session)
            .success(false)
            .ipAddress(getClientIpAddress(request))
            .userAgent(request.getHeader("User-Agent"))
            .build();

    // Verify OTP
    boolean isValid = otpService.verifyOtp(otp, session.getOtpHash());

    if (isValid) {
      // Mark attempt as successful
      attempt.setSuccess(true);
      mfaAttemptRepository.save(attempt);

      // Update session
      session.setStatus(MfaStatus.VERIFIED);
      session.setVerifiedAt(Timestamp.from(Instant.now()));
      session.setAttempts((short) (session.getAttempts() + 1));

      // Generate MFA token
      String mfaToken = generateMfaToken(userId, session.getAction(), sessionId);
      session.setMfaToken(mfaToken);
      session.setMfaTokenExpiresAt(
          Timestamp.from(Instant.now().plusSeconds(mfaTokenExpirySeconds)));

      mfaSessionRepository.save(session);

      log.info("MFA verification successful: sessionId={}, userId={}", sessionId, userId);
      return mfaToken;
    } else {
      // Increment attempts
      session.setAttempts((short) (session.getAttempts() + 1));
      if (session.getAttempts() >= session.getMaxAttempts()) {
        session.setStatus(MfaStatus.FAILED);
      }
      mfaSessionRepository.save(session);
      mfaAttemptRepository.save(attempt);

      log.warn(
          "MFA verification failed: sessionId={}, attempts={}", sessionId, session.getAttempts());
      throw new MfaException("Invalid OTP");
    }
  }

  /**
   * Validates an MFA token
   *
   * @param mfaToken MFA token to validate
   * @param requiredAction Required action (e.g., "MF_BUY")
   * @return true if valid, false otherwise
   */
  @Transactional(readOnly = true)
  public boolean validateMfaToken(String mfaToken, String requiredAction) {
    if (mfaToken == null || mfaToken.isEmpty()) {
      return false;
    }

    try {
      // Parse token
      String[] parts = mfaToken.split("\\.");
      if (parts.length != 4) {
        return false;
      }

      String userId = parts[0];
      String action = parts[1];
      String sessionIdStr = parts[2];
      String signature = parts[3];

      // Verify action matches
      if (!action.equals(requiredAction)) {
        log.warn("MFA token action mismatch: required={}, token={}", requiredAction, action);
        return false;
      }

      // Verify signature
      String expectedSignature = generateSignature(userId, action, sessionIdStr);
      if (!signature.equals(expectedSignature)) {
        log.warn("MFA token signature invalid");
        return false;
      }

      // Check session exists and is verified
      UUID sessionId = UUID.fromString(sessionIdStr);
      Optional<MfaSession> sessionOpt = mfaSessionRepository.findById(sessionId);
      if (sessionOpt.isEmpty()) {
        return false;
      }

      MfaSession session = sessionOpt.get();
      if (session.getStatus() != MfaStatus.VERIFIED) {
        return false;
      }

      // Check token expiry
      if (session.getMfaTokenExpiresAt() == null
          || session.getMfaTokenExpiresAt().before(Timestamp.from(Instant.now()))) {
        return false;
      }

      // Check token matches
      return mfaToken.equals(session.getMfaToken());
    } catch (Exception e) {
      log.error("Error validating MFA token: {}", e.getMessage(), e);
      return false;
    }
  }

  /**
   * Generates a short-lived MFA token
   *
   * @param userId User ID
   * @param action Action
   * @param sessionId Session ID
   * @return MFA token
   */
  private String generateMfaToken(String userId, String action, UUID sessionId) {
    String sessionIdStr = sessionId.toString();
    String signature = generateSignature(userId, action, sessionIdStr);
    return String.format("%s.%s.%s.%s", userId, action, sessionIdStr, signature);
  }

  /**
   * Generates HMAC signature for MFA token
   *
   * @param userId User ID
   * @param action Action
   * @param sessionId Session ID
   * @return Base64-encoded signature
   */
  private String generateSignature(String userId, String action, String sessionId) {
    try {
      Mac mac = Mac.getInstance(HMAC_ALGORITHM);
      SecretKeySpec secretKeySpec =
          new SecretKeySpec(mfaTokenSecret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
      mac.init(secretKeySpec);

      String data = userId + "." + action + "." + sessionId;
      byte[] signatureBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
      return Base64.getUrlEncoder().withoutPadding().encodeToString(signatureBytes);
    } catch (NoSuchAlgorithmException | InvalidKeyException e) {
      log.error("Failed to generate MFA token signature: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to generate MFA token", e);
    }
  }

  /**
   * Gets client IP address from request
   *
   * @param request HTTP request
   * @return IP address
   */
  private String getClientIpAddress(HttpServletRequest request) {
    String xForwardedFor = request.getHeader("X-Forwarded-For");
    if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
      return xForwardedFor.split(",")[0].trim();
    }
    String xRealIp = request.getHeader("X-Real-IP");
    if (xRealIp != null && !xRealIp.isEmpty()) {
      return xRealIp;
    }
    return request.getRemoteAddr();
  }

  /**
   * Masks phone number for logging
   *
   * @param phoneNumber Phone number
   * @return Masked phone number
   */
  private String maskPhoneNumber(String phoneNumber) {
    if (phoneNumber == null || phoneNumber.length() <= 4) {
      return "****";
    }
    return "****" + phoneNumber.substring(phoneNumber.length() - 4);
  }
}
