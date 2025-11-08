package com.nested.app.services;

import com.nested.app.entity.ReversePennyDrop;
import com.nested.app.repository.PaymentRepository;
import com.nested.app.repository.ReversePennyDropRepository;
import org.springframework.stereotype.Service;

import com.nested.app.client.bulkpe.ReversePennyDropClient;
import com.nested.app.client.bulkpe.dto.ReversePennyDropRequest;
import com.nested.app.client.bulkpe.dto.ReversePennyDropResponse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import static com.nested.app.listeners.UserPreFillHandler.generateRefId;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReversePennyDropService {

  private final ReversePennyDropClient reversePennyDropClient;
  private final ReversePennyDropRepository reversePennyDropRepository;

  /**
   * Initiate Reverse Penny Drop with Bulkpe and return the payment/validation details.
   */
  public ReversePennyDropResponse initiate(Long UserID) {
    ReversePennyDropRequest request = new ReversePennyDropRequest();

    String referenceId = generateRefId();
    request.setReferenceId(referenceId);

    String transactionNote = "Reverse Penny Drop for UserID: " + UserID;
    request.setTranscationNote(transactionNote);

    log.info("ReversePennyDropService.initiate referenceId={} for user={}", request.getReferenceId(), UserID);
    try {
      ReversePennyDropResponse response = reversePennyDropClient.getReversePennyDropUrl(request).block();
      if (response == null) {
        throw new RuntimeException("Null response from Reverse Penny Drop API");
      }

      ReversePennyDrop reversePennyDrop = new ReversePennyDrop();
      reversePennyDrop.setUserId(UserID);
      reversePennyDrop.setReferenceId(request.getReferenceId());
      reversePennyDrop.setTransactionNote(transactionNote);
      reversePennyDrop.setStatus( ReversePennyDrop.ReversePennyDropStatus.PENDING );
      reversePennyDropRepository.save(reversePennyDrop);

      return response;
    } catch (Exception e) {
      log.error("Failed to initiate reverse penny drop for referenceId={}: {}", request.getReferenceId(), e.getMessage(), e);
      throw new RuntimeException("Failed to initiate reverse penny drop", e);
    }
  }
}



