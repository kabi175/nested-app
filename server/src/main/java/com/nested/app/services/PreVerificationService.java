package com.nested.app.services;

import com.nested.app.contect.UserContext;
import com.nested.app.dto.PreVerificationData;
import java.util.List;

public interface PreVerificationService {
  List<PreVerificationData> getVerification(UserContext userContext, Long userID);

  boolean refresh(UserContext userContext, Long userID);
}
