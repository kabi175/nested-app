package com.nested.app.services;

import com.nested.app.client.bulkpe.dto.BulkpeWebhookRequest;
import com.nested.app.dto.BankAccountDto;
import com.nested.app.entity.BankDetail;
import com.nested.app.entity.ReversePennyDrop;
import com.nested.app.entity.User;
import com.nested.app.repository.BankDetailRepository;
import com.nested.app.repository.InvestorRepository;
import com.nested.app.repository.ReversePennyDropRepository;
import com.nested.app.repository.UserRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.text.similarity.LevenshteinDistance;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Service to handle Bulkpe webhook requests for reverse penny drop */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class BulkpeWebhookService {

  private final BankDetailRepository bankDetailRepository;
  private final UserRepository userRepository;
  private final InvestorRepository investorRepository;
  private final ReversePennyDropRepository reversePennyDropRepository;
  private final UserService userService;

  /**
   * Process webhook request from Bulkpe for reverse penny drop
   *
   * @param webhookRequest The webhook request from Bulkpe
   * @return true if processed successfully, false otherwise
   */
  public boolean processWebhook(BulkpeWebhookRequest webhookRequest) {
    log.info(
        "Processing Bulkpe webhook request: status={}, statusCode={}",
        webhookRequest.isStatus(),
        webhookRequest.getStatusCode());

    if (!webhookRequest.isStatus() || webhookRequest.getStatusCode() != 200) {
      log.warn(
          "Webhook request indicates failure: status={}, statusCode={}",
          webhookRequest.isStatus(),
          webhookRequest.getStatusCode());
      return false;
    }

    BulkpeWebhookRequest.WebhookData data = webhookRequest.getData();
    if (data == null) {
      log.error("Webhook data is null");
      return false;
    }

    // Only process if transaction is successful
    if (!"SUCCESS".equalsIgnoreCase(data.getTrxStatus())) {
      log.info("Transaction status is not SUCCESS: {}", data.getTrxStatus());
      return false;
    }

    String referenceId = data.getReferenceId();
    String accountNumber = data.getRemitterAccountNumber();
    String ifscCode = data.getRemitterIfsc();
    String transactionID = data.getTranscationId();
    String remitterName = data.getRemitterName();

    if(referenceId == null) {
        log.error("for testing");
        return true;
    }

    if (accountNumber == null || ifscCode == null) {
      log.error(
          "Missing required fields: referenceId={}, accountNumber={}, ifscCode={}",
          referenceId,
          accountNumber,
          ifscCode);
      return false;
    }

    ReversePennyDrop reversePennyDrop = reversePennyDropRepository.findByReferenceId(referenceId);
    if (reversePennyDrop == null) {
      log.error("No ReversePennyDrop found for transactionID: {}", transactionID);
      return false;
    }

    Long userID = reversePennyDrop.getUserId();
    log.debug("Processing webhook for userID: {}", userID);

    // Reference ID is the user ID - find the user
    Optional<User> userOptional = userRepository.findById(userID);
    if (userOptional.isEmpty()) {
      log.error("User not found for transactionID (userId): {}", transactionID);
      return false;
    }

    User user = userOptional.get();
    String userFirstName = user.getFirstName();
    String userLastName = user.getLastName();
    String userFullName = (userFirstName + " " + (userLastName != null ? userLastName : "")).trim();

    double similarity = calculateNameSimilarity(userFullName, remitterName);
    log.info("Name similarity between '{}' and '{}' = {}%", userFullName, remitterName, similarity * 100);

    if (similarity < 0.5) {
      log.warn("Name similarity below threshold ({}%), marking transaction as FAILED", similarity * 100);
      reversePennyDrop.setStatus(ReversePennyDrop.ReversePennyDropStatus.FAILED);
      reversePennyDropRepository.save(reversePennyDrop);
      return false;
    }

    // Check if bank detail already exists for this user with same account number and IFSC
    Optional<BankDetail> existingBankDetail =
        bankDetailRepository.findByAccountNumberAndIfscCode(accountNumber, ifscCode);

    if (existingBankDetail.isPresent()) {
      log.warn(
          "Bank already added existing_bank_id {} transactionID {}",
          existingBankDetail.get().getId(),
          transactionID);
      reversePennyDrop.setStatus(ReversePennyDrop.ReversePennyDropStatus.FAILED);
      reversePennyDropRepository.save(reversePennyDrop);
      return false;
    }
    // Create new bank detail for the user
    log.info("Creating new bank detail for user: {}", user.getId());
    createBankDetailFromWebhook(user, data);
    log.info(
        "Successfully processed webhook for userId={}, accountNumber={}",
        referenceId,
        accountNumber);
    reversePennyDrop.setStatus(ReversePennyDrop.ReversePennyDropStatus.COMPLETED);

    reversePennyDropRepository.save(reversePennyDrop);
    return true;
  }

  /** Create new bank detail entity from webhook data */
  private void createBankDetailFromWebhook(User user, BulkpeWebhookRequest.WebhookData data) {
    var bankDetail = new BankAccountDto();

    bankDetail.setAccountNumber(data.getRemitterAccountNumber());
    bankDetail.setIfsc(data.getRemitterIfsc());

    bankDetail.setAccountType(
        BankDetail.AccountType.SAVINGS); // Default account type, adjust as needed

    try {
      userService.addBankAccount(user.getId(), bankDetail);
    } catch (Exception e) {
        log.error("Could not add bank account for user {}", user.getId());
    }
    log.debug(
        "Created new bank detail for user {} with account number {}",
        user.getId(),
        data.getRemitterAccountNumber());
  }

  /**
   * Calculates a normalized similarity between two names using Levenshtein distance. Returns a
   * value between 0.0 and 1.0.
   */
  private double calculateNameSimilarity(String userName, String remitterName) {
    if (userName == null || remitterName == null) return 0.0;

    userName = userName.trim().toLowerCase();
    remitterName = remitterName.trim().toLowerCase();

    if (userName.isEmpty() || remitterName.isEmpty()) return 0.0;

    int distance = LevenshteinDistance.getDefaultInstance().apply(userName, remitterName);
    int maxLength = Math.max(userName.length(), remitterName.length());
    return 1.0 - ((double) distance / maxLength);
  }

}
