package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.client.mf.dto.KycVerificationResponse;
import com.nested.app.entity.UserVerification;
import com.nested.app.enums.VerificationCode;
import lombok.Data;

@Data
public class PreVerificationData {
  @JsonProperty("entity")
  private UserVerification.EntityType entityType;

  private String value;

  @JsonProperty("is_valid")
  private boolean isValid;

  @JsonProperty("is_pending")
  private boolean isPending;

  @JsonProperty("error_code")
  private VerificationCode errorCode;

  public static PreVerificationData fromEntity(UserVerification entity) {
    var dto = new PreVerificationData();
    dto.setEntityType(entity.getEntityType());
    dto.setValue(entity.getValue());
    dto.setErrorCode(entity.getErrorCode());
    dto.setPending(entity.getStatus() == KycVerificationResponse.RequestStatus.ACCEPTED);
    dto.setValid(entity.isVerified());
    return dto;
  }
}
