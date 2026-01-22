package com.nested.app.services;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailService {

  private final SendGrid sg;
  private final TemplateEngine templateEngine;

  @Value("${spring.mail.from:noreply@nested.money}")
  private String fromEmail;

  /**
   * Sends OTP via email
   *
   * @param email Recipient email address
   * @param otp OTP to send
   */
  public void sendOtpEmail(String email, String otp) {
    try {
      Email from = new Email(fromEmail);
      Email to = new Email(email);
      String subject = "Your Nested Verification Code";
      Content content =
          new Content(
              "text/plain",
              String.format(
                  "Your Nested verification code is: %s\n\n"
                      + "This code will expire in 60 seconds. Do not share this code with anyone.\n\n"
                      + "If you didn't request this code, please ignore this email.",
                  otp));
      Mail mail = new Mail(from, subject, to, content);
      Request request = new Request();

      request.setMethod(Method.POST);
      request.setEndpoint("mail/send");
      request.setBody(mail.build());
      Response response = sg.api(request);

      log.info(
          "Email OTP sent to {} (masked), Request Status: {}",
          maskEmail(email),
          response.getStatusCode());
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
   * Sends welcome email to user when KYC is completed successfully
   *
   * @param email Recipient email address
   * @param name User's name to personalize the email
   */
  public void sendWelcomeEmail(String email, String name) {
    try {
      Email from = new Email(fromEmail);
      Email to = new Email(email);
      String subject = "Welcome to NestEd - Your Investment Journey Begins!";

      // Process the template with Thymeleaf
      Context context = new Context();
      context.setVariable("Name", name != null ? name : "Investor");
      String htmlContent = templateEngine.process("customer-onboard-mail", context);

      Content content = new Content("text/html", htmlContent);
      Mail mail = new Mail(from, subject, to, content);
      Request request = new Request();

      request.setMethod(Method.POST);
      request.setEndpoint("mail/send");
      request.setBody(mail.build());
      Response response = sg.api(request);

      log.info(
          "Welcome email sent to {} (masked), Request Status: {}",
          maskEmail(email),
          response.getStatusCode());
    } catch (Exception e) {
      log.error("Failed to send welcome email to {}: {}", maskEmail(email), e.getMessage(), e);
      // Don't throw exception to avoid disrupting the KYC flow
    }
  }
}
