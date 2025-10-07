package com.nested.app.services;

import org.springframework.stereotype.Service;

import com.nested.app.client.bulkpe.dto.BulkpeWebhookPayload;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BulkpeWebhookService {

  /**
   * Handle credit notification from Bulkpe.
   * Idempotency and persistence can be introduced as needed.
   */
  public void handleCredit(BulkpeWebhookPayload payload) {
    if (payload == null || payload.getData() == null) {
      throw new IllegalArgumentException("Invalid webhook payload");
    }

    var data = payload.getData();
    log.info(
        "Bulkpe webhook received: trxId={}, status={}, amount={}, type={}, mode={}, utr={}",
        data.getTranscationId(),
        data.getTrx_status(),
        data.getAmount(),
        data.getType(),
        data.getPaymentMode(),
        data.getUtr());

    // TODO: persist transaction, reconcile orders/payments as needed
    // Example: If amount == 1 and type == Credit and status == SUCCESS -> mark RPD validated
  }
}


