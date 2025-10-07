package com.nested.app.client.bulkpe.dto;

import lombok.Data;

@Data
public class BulkpeWebhookPayload {
  private boolean status;
  private int statusCode;
  private DataPayload data;
  private String message;

  @Data
  public static class DataPayload {
    private String transcationId; // as sent by Bulkpe (typo preserved)
    private String trx_status; // e.g., SUCCESS/FAILED
    private String remiterName;
    private String remiterAccountNumber;
    private String remiterIfsc;
    private double amount;
    private String closingBalance;
    private String type; // Credit/Debit
    private String utr;
    private String paymentMode; // IMPS/NEFT/UPI
    private String paymentRemark;
    private boolean isVirtualAccount;
    private String SubVaId;
    private String vaName;
    private String SubVaAccountNumber;
    private String createdAt; // ISO timestamp
  }
}


