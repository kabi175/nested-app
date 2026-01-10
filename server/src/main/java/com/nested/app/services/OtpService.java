package com.nested.app.services;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class OtpService {

  private static final int OTP_LENGTH = 6;
  private static final String HASH_ALGORITHM = "SHA-256";
  private final SecureRandom secureRandom = new SecureRandom();

  /**
   * Generates a random 6-digit OTP
   *
   * @return 6-digit OTP string
   */
  public String generateOtp() {
    int otp = 100000 + secureRandom.nextInt(900000);
    return String.valueOf(otp);
  }

  /**
   * Hashes the OTP using SHA-256
   *
   * @param otp Plain text OTP
   * @return SHA-256 hash of the OTP (64 character hex string)
   */
  public String hashOtp(String otp) {
    try {
      MessageDigest digest = MessageDigest.getInstance(HASH_ALGORITHM);
      byte[] hashBytes = digest.digest(otp.getBytes(StandardCharsets.UTF_8));

      // Convert bytes to hex string
      StringBuilder hexString = new StringBuilder();
      for (byte b : hashBytes) {
        String hex = Integer.toHexString(0xff & b);
        if (hex.length() == 1) {
          hexString.append('0');
        }
        hexString.append(hex);
      }
      return hexString.toString();
    } catch (NoSuchAlgorithmException e) {
      log.error("Failed to hash OTP: {}", e.getMessage(), e);
      throw new RuntimeException("Failed to hash OTP", e);
    }
  }

  /**
   * Verifies an OTP against a hash
   *
   * @param otp Plain text OTP to verify
   * @param hash Stored hash to compare against
   * @return true if OTP matches the hash, false otherwise
   */
  public boolean verifyOtp(String otp, String hash) {
    if (otp == null || hash == null) {
      return false;
    }
    String computedHash = hashOtp(otp);
    return computedHash.equals(hash);
  }
}
