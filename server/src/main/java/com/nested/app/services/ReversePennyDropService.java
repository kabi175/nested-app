package com.nested.app.services;

import static com.nested.app.listeners.UserPreFillHandler.generateRefId;

import com.nested.app.client.bulkpe.ReversePennyDropClient;
import com.nested.app.client.bulkpe.dto.ReversePennyDropRequest;
import com.nested.app.client.bulkpe.dto.ReversePennyDropResponse;
import com.nested.app.entity.ReversePennyDrop;
import com.nested.app.exception.ExternalServiceException;
import com.nested.app.repository.ReversePennyDropRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReversePennyDropService {

  private final ReversePennyDropClient reversePennyDropClient;
  private final ReversePennyDropRepository reversePennyDropRepository;

  /** Initiate Reverse Penny Drop with Bulkpe and return the payment/validation details. */
  public ReversePennyDropResponse initiate(Long userID) {
    ReversePennyDropRequest request = new ReversePennyDropRequest();

    String referenceId = generateRefId();
    request.setReferenceId(referenceId);

    String transactionNote = "Reverse Penny Drop for userID: " + userID;
    request.setTranscationNote(transactionNote);

    log.info(
        "ReversePennyDropService.initiate referenceId={} for user={}",
        request.getReferenceId(),
        userID);
    try {
      ReversePennyDropResponse response = reversePennyDropClient.getReversePennyDropUrl(request).block();
      if (response == null) {
        throw new ExternalServiceException("Null response from Reverse Penny Drop API");
      }

      ReversePennyDrop reversePennyDrop = new ReversePennyDrop();
      reversePennyDrop.setUserId(userID);
      reversePennyDrop.setReferenceId(referenceId);
      reversePennyDrop.setTransactionNote(transactionNote);
      reversePennyDrop.setStatus( ReversePennyDrop.ReversePennyDropStatus.PENDING );
      reversePennyDrop.setTransactionId(response.getData().getTransactionId());
      reversePennyDropRepository.save(reversePennyDrop);

      return response;
    } catch (Exception e) {
      log.error("Failed to initiate reverse penny drop for referenceId={}: {}", request.getReferenceId(), e.getMessage(), e);
      throw new ExternalServiceException("Failed to initiate reverse penny drop", e);
    }
  }

  /**
   * Fetches the status of a Reverse Penny Drop transaction.
   *
   * @param userId      ID of the user requesting the status
   * @param referenceId Reference ID of the transaction
   * @return ReversePennyDropResponse containing status and metadata
   */
  public ReversePennyDropResponse getStatusOfPennyDrop(Long userId, String referenceId) {
    // Validate inputs
    if (userId == null || referenceId == null || referenceId.isBlank()) {
      throw new IllegalArgumentException("User ID and Reference ID must not be null or blank.");
    }

    // Fetch entity from repository
    ReversePennyDrop reversePennyDrop = reversePennyDropRepository.findByReferenceId(referenceId);

    if (reversePennyDrop == null) {
      ReversePennyDropResponse response = new ReversePennyDropResponse();
      response.setStatus(false);
      response.setStatusCode(404);
      response.setMessage("No Reverse Penny Drop record found for the given reference ID.");
      response.setData(null);
      return response;
    }

    // Ensure the user has permission to view this record
    if (!reversePennyDrop.getUserId().equals(userId)) {
      ReversePennyDropResponse response = new ReversePennyDropResponse();
      response.setStatus(false);
      response.setStatusCode(403);
      response.setMessage("User not authorized to access this transaction.");
      response.setData(null);
      return response;
    }

    // Build response data object
    ReversePennyDropResponse.ResponseData data = new ReversePennyDropResponse.ResponseData();
    data.setReferenceId(reversePennyDrop.getReferenceId());
    data.setTransactionId(reversePennyDrop.getTransactionId());
    data.setMessage(reversePennyDrop.getTransactionNote());
    data.setStatus(reversePennyDrop.getStatus().getValue());
    data.setAmount(0.0); // placeholder — depends on your business logic
    data.setUpi("N/A");  // placeholder — set real UPI if available

    // Construct final response
    ReversePennyDropResponse response = new ReversePennyDropResponse();
    response.setStatus(true);
    response.setStatusCode(200);
    response.setMessage("Reverse Penny Drop status retrieved successfully.");
    response.setData(data);

    return response;
  }


}



