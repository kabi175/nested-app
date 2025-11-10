package com.nested.app.services;

import com.nested.app.dto.MinifiedUserDTO;
import org.springframework.web.multipart.MultipartFile;

public interface InvestorService {
  void createInvestor(MinifiedUserDTO user);

  void createKycRequest(MinifiedUserDTO user);

  String eSignDocument(MinifiedUserDTO user);

  String aadhaarUploadViaURL(MinifiedUserDTO user);

  void uploadSignature(MinifiedUserDTO user, MultipartFile signatureFile);
}
