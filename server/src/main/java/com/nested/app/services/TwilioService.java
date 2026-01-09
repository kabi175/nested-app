package com.nested.app.services;

import com.nested.app.enums.MfaChannel;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@RequiredArgsConstructor
public class TwilioService {

  private final EmailService emailService;

  @Value("${twilio.sms.from-number}")
  private String fromNumber;

  @Value("${twilio.whatsapp.from-number:}")
  private String whatsappFromNumber;

  /**
   * Sends OTP via SMS using Twilio
   *
   * @param phoneNumber Recipient phone number (E.164 format)
   * @param otp OTP to send
   * @return Message SID if successful
   */
  public String sendSmsOtp(String phoneNumber, String otp) {
    try {
      String messageBody =
          String.format("Your Nested verification code is: %s. Do not share this code.", otp);

      Message message =
          Message.creator(new PhoneNumber(phoneNumber), new PhoneNumber(fromNumber), messageBody)
              .create();

      log.info(
          "SMS OTP sent to {} (masked), Message SID: {}",
          maskPhoneNumber(phoneNumber),
          message.getSid());
      return message.getSid();
    } catch (Exception e) {
      log.error(
          "Failed to send SMS OTP to {}: {}", maskPhoneNumber(phoneNumber), e.getMessage(), e);
      throw new RuntimeException("Failed to send SMS OTP", e);
    }
  }

  /**
   * Sends OTP via WhatsApp using Twilio
   *
   * @param phoneNumber Recipient phone number (E.164 format)
   * @param otp OTP to send
   * @return Message SID if successful
   */
  public String sendWhatsAppOtp(String phoneNumber, String otp) {
    try {
      if (whatsappFromNumber == null || whatsappFromNumber.isEmpty()) {
        log.warn("WhatsApp from number not configured, falling back to SMS");
        return sendSmsOtp(phoneNumber, otp);
      }

      String messageBody =
          String.format("Your Nested verification code is: %s. Do not share this code.", otp);
      String whatsappTo = "whatsapp:" + phoneNumber;
      String whatsappFrom = "whatsapp:" + whatsappFromNumber;

      Message message =
          Message.creator(new PhoneNumber(whatsappTo), new PhoneNumber(whatsappFrom), messageBody)
              .create();

      log.info(
          "WhatsApp OTP sent to {} (masked), Message SID: {}",
          maskPhoneNumber(phoneNumber),
          message.getSid());
      return message.getSid();
    } catch (Exception e) {
      log.error(
          "Failed to send WhatsApp OTP to {}: {}", maskPhoneNumber(phoneNumber), e.getMessage(), e);
      throw new RuntimeException("Failed to send WhatsApp OTP", e);
    }
  }

  /**
   * Sends OTP via the specified channel
   *
   * @param phoneNumber Recipient phone number
   * @param otp OTP to send
   * @param channel SMS or WHATSAPP
   * @return Message SID if successful
   */
  public String sendOtp(String phoneNumber, String otp, MfaChannel channel) {
    return switch (channel) {
      case SMS -> sendSmsOtp(phoneNumber, otp);
      case WHATSAPP -> sendWhatsAppOtp(phoneNumber, otp);
      case EMAIL -> sendEmailOtp(phoneNumber, otp);
      case TOTP -> throw new UnsupportedOperationException("TOTP channel not supported via Twilio");
    };
  }

  /**
   * Sends OTP via email using EmailService Note: phoneNumber parameter actually contains email
   * address for EMAIL channel
   *
   * @param email Recipient email address (passed as phoneNumber parameter for consistency)
   * @param otp OTP to send
   * @return "email-sent" as success indicator
   */
  public String sendEmailOtp(String email, String otp) {
    try {
      emailService.sendOtpEmail(email, otp);
      log.info("Email OTP sent successfully to {}", maskEmail(email));
      return "email-sent";
    } catch (Exception e) {
      log.error("Failed to send email OTP to {}: {}", maskEmail(email), e.getMessage(), e);
      throw new RuntimeException("Failed to send email OTP", e);
    }
  }

  /**
   * Masks email address for logging (shows only first 2 chars and domain)
   *
   * @param email Email address to mask
   * @return Masked email address
   */
  private String maskEmail(String email) {
    if (email == null || email.isEmpty()) {
      return "****";
    }
    int atIndex = email.indexOf('@');
    if (atIndex <= 0 || atIndex >= email.length() - 1) {
      return "****";
    }
    String localPart = email.substring(0, atIndex);
    String domain = email.substring(atIndex + 1);
    if (localPart.length() <= 2) {
      return "**@" + domain;
    }
    return localPart.substring(0, 2) + "***@" + domain;
  }

  /**
   * Masks phone number for logging (shows only last 4 digits)
   *
   * @param phoneNumber Phone number to mask
   * @return Masked phone number
   */
  private String maskPhoneNumber(String phoneNumber) {
    if (phoneNumber == null || phoneNumber.length() <= 4) {
      return "****";
    }
    return "****" + phoneNumber.substring(phoneNumber.length() - 4);
  }
}
