package com.nested.app.services;

import java.util.Optional;

import com.nested.app.entity.Investor;
import com.nested.app.entity.ReversePennyDrop;
import com.nested.app.entity.User;
import com.nested.app.repository.InvestorRepository;
import com.nested.app.repository.ReversePennyDropRepository;
import com.nested.app.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nested.app.client.bulkpe.dto.BulkpeWebhookRequest;
import com.nested.app.entity.BankDetail;
import com.nested.app.repository.BankDetailRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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

    if (referenceId == null || accountNumber == null || ifscCode == null) {
      log.error(
          "Missing required fields: referenceId={}, accountNumber={}, ifscCode={}",
          referenceId,
          accountNumber,
          ifscCode);
      return false;
    }

    ReversePennyDrop reversePennyDrop = reversePennyDropRepository.findByReferenceId(referenceId);
    if (reversePennyDrop == null) {
      log.error("No ReversePennyDrop found for referenceId: {}", referenceId);
      return false;
    }

    Long userID = reversePennyDrop.getUserId();
    log.debug("Processing webhook for userID: {}", userID);

    // Reference ID is the user ID - find the user
    Optional<User> userOptional = userRepository.findById(userID);
    if (userOptional.isEmpty()) {
      log.error("User not found for referenceId (userId): {}", referenceId);
      return false;
    }
    User user = userOptional.get();

    Optional<Investor> investorOptional = investorRepository.findById(Long.parseLong(referenceId));
    if (investorOptional.isEmpty()) {
      log.error("User not found for referenceId (userId): {}", referenceId);
      return false;
    }
    Investor investor = investorOptional.get();

    // Check if bank detail already exists for this user with same account number and IFSC
    Optional<BankDetail> existingBankDetail =
        bankDetailRepository.findByAccountNumberAndIfscCode(accountNumber, ifscCode);

    BankDetail bankDetail;
    if (existingBankDetail.isPresent()) {
      // Update existing bank detail
      bankDetail = existingBankDetail.get();
      log.info(
          "Updating existing bank detail with ID: {} for user: {}",
          bankDetail.getId(),
          user.getId());
      updateBankDetailFromWebhook(bankDetail, data);
    } else {
      // Create new bank detail for the user
      log.info("Creating new bank detail for user: {}", user.getId());
      bankDetail = createBankDetailFromWebhook(user, data, investor);
    }

    bankDetailRepository.save(bankDetail);
    log.info(
        "Successfully processed webhook for userId={}, accountNumber={}, bankDetailId={}",
        referenceId,
        accountNumber,
        bankDetail.getId());

    reversePennyDrop.setStatus(ReversePennyDrop.ReversePennyDropStatus.COMPLETED);

    reversePennyDropRepository.save(reversePennyDrop);
    return true;
  }

  /** Create new bank detail entity from webhook data */
  private BankDetail createBankDetailFromWebhook(
      User user, BulkpeWebhookRequest.WebhookData data, Investor investor) {
    BankDetail bankDetail = new BankDetail();

    bankDetail.setUser(user);
    bankDetail.setInvestor(investor);
    bankDetail.setAccountNumber(data.getRemitterAccountNumber());
    bankDetail.setIfscCode(data.getRemitterIfsc());

    // Extract bank name from IFSC or use remitter name
    String bankName = extractBankName(data.getRemitterIfsc(), data.getRemitterName());
    bankDetail.setBankName(bankName);

    // Set reference ID
    bankDetail.setRefId(data.getReferenceId());

    bankDetail.setAccountType(
        BankDetail.AccountType.SAVINGS); // Default account type, adjust as needed

    log.debug(
        "Created new bank detail for user {} with account number {}",
        user.getId(),
        data.getRemitterAccountNumber());

    return bankDetail;
  }

  /** Update bank detail entity with data from webhook */
  private void updateBankDetailFromWebhook(
      BankDetail bankDetail, BulkpeWebhookRequest.WebhookData data) {
    // Update account number and IFSC if they match (should be the same)
    if (data.getRemitterAccountNumber() != null) {
      bankDetail.setAccountNumber(data.getRemitterAccountNumber());
    }

    if (data.getRemitterIfsc() != null) {
      bankDetail.setIfscCode(data.getRemitterIfsc());
    }

    // Extract bank name from IFSC (first 4 characters) or use remitter name
    String bankName = extractBankName(data.getRemitterIfsc(), data.getRemitterName());
    bankDetail.setBankName(bankName);

    // Update refId if reference_id is provided
    if (data.getReferenceId() != null) {
      bankDetail.setRefId(data.getReferenceId());
    }

    log.debug("Updated bank detail {} with webhook data", bankDetail.getId());
  }

  /**
   * Extract bank name from IFSC code or use remitter name IFSC code format: XXXX0YYYYY where first
   * 4 chars are bank code
   */
  private String extractBankName(String ifscCode, String remitterName) {
    if (ifscCode != null && ifscCode.length() >= 4) {
      // Map common IFSC bank codes to bank names
      String bankCode = ifscCode.substring(0, 4);
      String bankName = getBankNameFromCode(bankCode);
      if (bankName != null) {
        return bankName;
      }
    }

    // Fallback to remitter name or generic name
    if (remitterName != null && !remitterName.isEmpty()) {
      return remitterName;
    }

    return "Bank"; // Default fallback
  }

  /** Map IFSC bank code to bank name */
  private String getBankNameFromCode(String bankCode) {
    // Common bank codes mapping
    return switch (bankCode) {
      case "HDFC" -> "HDFC Bank";
      case "SBIN" -> "State Bank of India";
      case "ICIC" -> "ICICI Bank";
      case "AXIS", "UTIB" -> "Axis Bank";
      case "KOTB" -> "Kotak Mahindra Bank";
      case "YESB" -> "Yes Bank";
      case "INDB" -> "IndusInd Bank";
      case "PUNB" -> "Punjab National Bank";
      case "BARC" -> "Baroda Bank";
      case "CNRB" -> "Canara Bank";
      case "UBIN" -> "Union Bank of India";
      default -> bankCode;
    };
  }
}
