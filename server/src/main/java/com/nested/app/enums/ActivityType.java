package com.nested.app.enums;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public enum ActivityType {
  BANK_ACCOUNT_PENDING("bank_account_pending"),
  PROFILE_INCOMPLETE("profile_incomplete"),
  GOAL_PAYMENT_PENDING("goal_payment_pending"),
  KYC_INCOMPLETE("kyc_incomplete");
  @Getter @JsonValue private final String value;
}
