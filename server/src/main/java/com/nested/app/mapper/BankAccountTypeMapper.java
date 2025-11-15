package com.nested.app.mapper;

import com.nested.app.client.mf.dto.BankAccountRequest;
import com.nested.app.entity.BankDetail;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Mapper for converting between BankDetail.AccountType and BankAccountRequest.AccountType enums.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class BankAccountTypeMapper {

  /**
   * Converts BankDetail.AccountType (entity) to BankAccountRequest.AccountType (client DTO).
   *
   * @param accountType the entity account type
   * @return the corresponding client account type, or null if input is null
   */
  public static BankAccountRequest.AccountType toDtoAccountType(
      BankDetail.AccountType accountType) {
    if (accountType == null) {
      return null;
    }
    return BankAccountRequest.AccountType.valueOf(accountType.name());
  }

  /**
   * Converts BankAccountRequest.AccountType (client DTO) to BankDetail.AccountType (entity).
   *
   * @param accountType the client account type
   * @return the corresponding entity account type, or null if input is null
   * @throws IllegalArgumentException if the account type cannot be converted (e.g., NRE, NRO)
   */
  public static BankDetail.AccountType toEntityAccountType(
      BankAccountRequest.AccountType accountType) {
    if (accountType == null) {
      return null;
    }
    try {
      return BankDetail.AccountType.valueOf(accountType.name());
    } catch (IllegalArgumentException e) {
      throw new IllegalArgumentException(
          "Account type " + accountType.name() + " is not supported for entity storage", e);
    }
  }
}
