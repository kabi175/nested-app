package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.entity.BankDetail;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BankAccountDto {

  @JsonFormat(shape = JsonFormat.Shape.STRING)
  private Long id;

  @JsonProperty("account_type")
  @Enumerated(EnumType.STRING)
  private BankDetail.AccountType accountType;

  @JsonProperty("account_number")
  private String accountNumber;

  @JsonProperty("ifsc")
  private String ifsc;

  @JsonProperty("is_primary")
  private boolean isPrimary;

  public static BankAccountDto fromEntity(BankDetail bankDetail) {
    return new BankAccountDto(
        bankDetail.getId(),
        bankDetail.getAccountType(),
        bankDetail.getAccountNumber(),
        bankDetail.getIfscCode(),
        bankDetail.isPrimary());
  }

  public BankDetail toEntity() {
    BankDetail bankDetail = new BankDetail();
    bankDetail.setAccountType(this.accountType);
    bankDetail.setAccountNumber(this.accountNumber);
    bankDetail.setIfscCode(this.ifsc);
    bankDetail.setPrimary(this.isPrimary);
    bankDetail.setId(this.id);
    return bankDetail;
  }
}
