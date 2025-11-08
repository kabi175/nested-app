package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.hibernate.validator.constraints.Length;

@Builder
@Data
public class BankAccountRequest {
  @JsonProperty("profile")
  private String investorID;

  @JsonProperty("type")
  private AccountType accountType;

  @Length(min = 9, max = 18)
  private String accountNumber;

  @JsonProperty("ifsc_code")
  private String ifsc;

  @RequiredArgsConstructor
  public enum AccountType {
    SAVINGS("savings"),
    CURRENT("current"),
    NRE("nre"),
    NRO("nro");

    @Getter @JsonValue private final String value;
  }

  public enum VerificationDocumentType {
    CANCELLED_CHEQUE,
    BANK_STATEMENT
  }
}
