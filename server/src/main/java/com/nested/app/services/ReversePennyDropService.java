package com.nested.app.services;

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

  /**
   * Initiate Reverse Penny Drop with Bulkpe and return the payment/validation details.
   */
  public ReversePennyDropResponse initiate() {
    ReversePennyDropRequest request = new ReversePennyDropRequest();
    request.setReferenceId(generateRefId());
    request.setTranscationNote("Reverser penny drop"); //TODO : add valid note
    log.info("ReversePennyDropService.initiate referenceId={}", request.getReferenceId());
    try {
      ReversePennyDropResponse response = reversePennyDropClient.getReversePennyDropUrl(request).block();
      if (response == null) {
        throw new RuntimeException("Null response from Reverse Penny Drop API");
      }
      return response;
    } catch (Exception e) {
      log.error("Failed to initiate reverse penny drop for referenceId={}: {}", request.getReferenceId(), e.getMessage(), e);
      throw new RuntimeException("Failed to initiate reverse penny drop", e);
    }
  }
}



