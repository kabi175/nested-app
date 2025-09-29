package com.nested.app.client.tarrakki.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class BankAccountRequest {
  private AccountType account_type;
  private String account_number;
  private String ifsc;
  private VerificationDocumentType verification_document;
  private MultipartFile file;
  public enum AccountType {
    SAVINGS,
    CURRENT,
    NRE,
    NRO
  }
  public enum VerificationDocumentType {
    CANCELLED_CHEQUE,
    BANK_STATEMENT
  }
}
