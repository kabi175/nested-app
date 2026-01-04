package com.nested.app.services;

import com.nested.app.enums.MfaChannel;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class TwilioService {

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
      case TOTP -> throw new UnsupportedOperationException("TOTP channel not supported via Twilio");
    };
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
