package com.nested.app.services;

import static org.assertj.core.api.Assertions.assertThat;

import com.nested.app.repository.BankDetailRepository;
import com.nested.app.repository.InvestorRepository;
import com.nested.app.repository.ReversePennyDropRepository;
import com.nested.app.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class BulkpeWebhookServiceTest {

  @Mock private BankDetailRepository bankDetailRepository;
  @Mock private UserRepository userRepository;
  @Mock private InvestorRepository investorRepository;
  @Mock private ReversePennyDropRepository reversePennyDropRepository;
  @Mock private UserService userService;

  @InjectMocks private BulkpeWebhookService bulkpeWebhookService;

  @BeforeEach
  void setUp() {
    // Setup if needed
  }

  @Test
  void calculateNameSimilarity_shouldReturnOne_whenNamesAreIdentical() {
    double result = invokeCalculateNameSimilarity("John Doe", "John Doe");
    assertThat(result).isEqualTo(1.0);
  }

  @Test
  void calculateNameSimilarity_shouldReturnOne_whenNamesAreIdenticalIgnoringCase() {
    double result = invokeCalculateNameSimilarity("John Doe", "john doe");
    assertThat(result).isEqualTo(1.0);
  }

  @Test
  void calculateNameSimilarity_shouldReturnOne_whenNamesAreIdenticalWithExtraSpaces() {
    double result = invokeCalculateNameSimilarity("  John Doe  ", "John Doe");
    assertThat(result).isEqualTo(1.0);
  }

  @Test
  void calculateNameSimilarity_shouldReturnZero_whenUserNameIsNull() {
    double result = invokeCalculateNameSimilarity(null, "John Doe");
    assertThat(result).isEqualTo(0.0);
  }

  @Test
  void calculateNameSimilarity_shouldReturnZero_whenRemitterNameIsNull() {
    double result = invokeCalculateNameSimilarity("John Doe", null);
    assertThat(result).isEqualTo(0.0);
  }

  @Test
  void calculateNameSimilarity_shouldReturnZero_whenBothNamesAreNull() {
    double result = invokeCalculateNameSimilarity(null, null);
    assertThat(result).isEqualTo(0.0);
  }

  @Test
  void calculateNameSimilarity_shouldReturnZero_whenUserNameIsEmpty() {
    double result = invokeCalculateNameSimilarity("", "John Doe");
    assertThat(result).isEqualTo(0.0);
  }

  @Test
  void calculateNameSimilarity_shouldReturnZero_whenRemitterNameIsEmpty() {
    double result = invokeCalculateNameSimilarity("John Doe", "");
    assertThat(result).isEqualTo(0.0);
  }

  @Test
  void calculateNameSimilarity_shouldReturnZero_whenBothNamesAreEmpty() {
    double result = invokeCalculateNameSimilarity("", "");
    assertThat(result).isEqualTo(0.0);
  }

  @Test
  void calculateNameSimilarity_shouldReturnZero_whenNamesAreCompletelyDifferent() {
    double result = invokeCalculateNameSimilarity("John", "XXXX");
    assertThat(result).isEqualTo(0.0);
  }

  @Test
  void calculateNameSimilarity_shouldReturnHighSimilarity_whenNamesAreSlightlyDifferent() {
    // "John Doe" vs "John Do" - only 1 character difference
    double result = invokeCalculateNameSimilarity("John Doe", "John Do");
    // distance = 1, maxLength = 8, similarity = 1 - (1/8) = 0.875
    assertThat(result).isGreaterThanOrEqualTo(0.8);
  }

  @Test
  void calculateNameSimilarity_shouldReturnModerateSimilarity_whenNamesHaveTypos() {
    // "Rajesh Kumar" vs "Rajesh Kuamr" - transposition
    double result = invokeCalculateNameSimilarity("Rajesh Kumar", "Rajesh Kuamr");
    assertThat(result).isGreaterThanOrEqualTo(0.8);
  }

  @Test
  void calculateNameSimilarity_shouldReturnLowSimilarity_whenNamesAreMostlyDifferent() {
    double result = invokeCalculateNameSimilarity("John Doe", "Jane Smith");
    assertThat(result).isLessThan(0.5);
  }

  @Test
  void calculateNameSimilarity_shouldHandleSingleCharacterNames() {
    double result = invokeCalculateNameSimilarity("A", "A");
    assertThat(result).isEqualTo(1.0);
  }

  @Test
  void calculateNameSimilarity_shouldHandleSingleCharacterDifference() {
    double result = invokeCalculateNameSimilarity("A", "B");
    assertThat(result).isEqualTo(0.0);
  }

  @Test
  void calculateNameSimilarity_shouldHandleNamesWithMiddleName() {
    double result = invokeCalculateNameSimilarity("John Michael Doe", "John M Doe");
    assertThat(result).isGreaterThan(0.5);
  }

  @Test
  void calculateNameSimilarity_shouldNotBeAffectedByWordOrder() {
    // Swapped first and last name should still have high similarity
    double result = invokeCalculateNameSimilarity("John Doe", "Doe John");
    assertThat(result).isEqualTo(1.0);
  }

  @Test
  void calculateNameSimilarity_shouldNotBeAffectedByWordOrder_withThreeWords() {
    // Different word order with three words
    double result =
        invokeCalculateNameSimilarity("Sankara Reddy Dosakayala", "DOSAKAYALA SANKARA REDDY");
    assertThat(result).isEqualTo(1.0);
  }

  @Test
  void calculateNameSimilarity_shouldNotBeAffectedByWordOrder_withPartialMatch() {
    // Different word order with slight difference
    double result1 = invokeCalculateNameSimilarity("John Doe", "Doe Jon");
    double result2 = invokeCalculateNameSimilarity("John Doe", "Jon Doe");
    // Both should have same similarity since word order doesn't matter
    assertThat(result1).isEqualTo(result2);
  }

  @Test
  void calculateNameSimilarity_shouldHandleWhitespaceOnlyStrings() {
    double result = invokeCalculateNameSimilarity("   ", "John Doe");
    assertThat(result).isEqualTo(0.0);
  }

  /** Helper method to invoke the private calculateNameSimilarity method using reflection. */
  private double invokeCalculateNameSimilarity(String userName, String remitterName) {
    return (double)
        ReflectionTestUtils.invokeMethod(
            bulkpeWebhookService, "calculateNameSimilarity", userName, remitterName);
  }
}
