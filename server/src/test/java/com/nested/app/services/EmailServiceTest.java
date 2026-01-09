package com.nested.app.services;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import java.io.IOException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

  private static final String TEST_FROM_EMAIL = "test@nested.money";
  private static final String TEST_RECIPIENT_EMAIL = "user@example.com";
  private static final String TEST_OTP = "123456";
  @Mock private SendGrid sendGrid;
  @InjectMocks private EmailService emailService;

  @BeforeEach
  void setUp() {
    ReflectionTestUtils.setField(emailService, "fromEmail", TEST_FROM_EMAIL);
  }

  @Test
  void shouldSendOtpEmailSuccessfully() throws Exception {
    // Given
    Response mockResponse = new Response();
    mockResponse.setStatusCode(202);
    when(sendGrid.api(any(Request.class))).thenReturn(mockResponse);

    // When
    emailService.sendOtpEmail(TEST_RECIPIENT_EMAIL, TEST_OTP);

    // Then
    ArgumentCaptor<Request> requestCaptor = ArgumentCaptor.forClass(Request.class);
    verify(sendGrid).api(requestCaptor.capture());

    Request capturedRequest = requestCaptor.getValue();
    assertThat(capturedRequest.getMethod()).isEqualTo(Method.POST);
    assertThat(capturedRequest.getEndpoint()).isEqualTo("mail/send");
    assertThat(capturedRequest.getBody()).isNotNull();
    assertThat(capturedRequest.getBody()).contains(TEST_RECIPIENT_EMAIL);
    assertThat(capturedRequest.getBody()).contains(TEST_OTP);
    assertThat(capturedRequest.getBody()).contains(TEST_FROM_EMAIL);
    assertThat(capturedRequest.getBody()).contains("Your Nested Verification Code");
    assertThat(capturedRequest.getBody()).contains("This code will expire in 60 seconds");
  }

  @Test
  void shouldHandleSendGridException() throws Exception {
    // Given
    IOException sendGridException = new IOException("SendGrid API error");
    doThrow(sendGridException).when(sendGrid).api(any(Request.class));

    // When & Then
    assertThatThrownBy(() -> emailService.sendOtpEmail(TEST_RECIPIENT_EMAIL, TEST_OTP))
        .isInstanceOf(RuntimeException.class)
        .hasMessage("Failed to send email OTP")
        .hasCause(sendGridException);

    verify(sendGrid).api(any(Request.class));
  }

  @Test
  void shouldFormatOtpEmailContentCorrectly() throws Exception {
    // Given
    Response mockResponse = new Response();
    mockResponse.setStatusCode(202);
    when(sendGrid.api(any(Request.class))).thenReturn(mockResponse);

    // When
    emailService.sendOtpEmail(TEST_RECIPIENT_EMAIL, TEST_OTP);

    // Then
    ArgumentCaptor<Request> requestCaptor = ArgumentCaptor.forClass(Request.class);
    verify(sendGrid).api(requestCaptor.capture());

    String requestBody = requestCaptor.getValue().getBody();
    assertThat(requestBody).contains("Your Nested verification code is: " + TEST_OTP);
    assertThat(requestBody).contains("This code will expire in 60 seconds");
    assertThat(requestBody).contains("Do not share this code with anyone");
    assertThat(requestBody).contains("If you didn't request this code, please ignore this email");
  }

  @Test
  void shouldUseConfiguredFromEmail() throws Exception {
    // Given
    String customFromEmail = "custom@nested.money";
    ReflectionTestUtils.setField(emailService, "fromEmail", customFromEmail);

    Response mockResponse = new Response();
    mockResponse.setStatusCode(202);
    when(sendGrid.api(any(Request.class))).thenReturn(mockResponse);

    // When
    emailService.sendOtpEmail(TEST_RECIPIENT_EMAIL, TEST_OTP);

    // Then
    ArgumentCaptor<Request> requestCaptor = ArgumentCaptor.forClass(Request.class);
    verify(sendGrid).api(requestCaptor.capture());

    String requestBody = requestCaptor.getValue().getBody();
    assertThat(requestBody).contains(customFromEmail);
  }

  @Test
  void shouldHandleDifferentOtpValues() throws Exception {
    // Given
    String differentOtp = "987654";
    Response mockResponse = new Response();
    mockResponse.setStatusCode(202);
    when(sendGrid.api(any(Request.class))).thenReturn(mockResponse);

    // When
    emailService.sendOtpEmail(TEST_RECIPIENT_EMAIL, differentOtp);

    // Then
    ArgumentCaptor<Request> requestCaptor = ArgumentCaptor.forClass(Request.class);
    verify(sendGrid).api(requestCaptor.capture());

    String requestBody = requestCaptor.getValue().getBody();
    assertThat(requestBody).contains("Your Nested verification code is: " + differentOtp);
  }

  @Test
  void shouldHandleDifferentRecipientEmails() throws Exception {
    // Given
    String differentRecipient = "another@example.com";
    Response mockResponse = new Response();
    mockResponse.setStatusCode(202);
    when(sendGrid.api(any(Request.class))).thenReturn(mockResponse);

    // When
    emailService.sendOtpEmail(differentRecipient, TEST_OTP);

    // Then
    ArgumentCaptor<Request> requestCaptor = ArgumentCaptor.forClass(Request.class);
    verify(sendGrid).api(requestCaptor.capture());

    String requestBody = requestCaptor.getValue().getBody();
    assertThat(requestBody).contains(differentRecipient);
  }
}
