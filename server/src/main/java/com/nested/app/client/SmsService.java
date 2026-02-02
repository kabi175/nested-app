package com.nested.app.client;

public interface SmsService {
  void sendOTP(String fromPhoneNumber, String toPhoneNumber, String otp);
}
