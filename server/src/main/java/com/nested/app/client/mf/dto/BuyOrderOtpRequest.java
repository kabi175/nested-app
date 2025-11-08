package com.nested.app.client.mf.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class BuyOrderOtpRequest extends OtpRequest {
  String fundID;
  String folio;

  public static BuyOrderOtpRequest getInstance(String investorID, String fundID) {
    return getInstance(investorID, fundID, null);
  }

  public static BuyOrderOtpRequest getInstance(String investorID, String fundID, String folio) {
    BuyOrderOtpRequest request = new BuyOrderOtpRequest();
    request.setOtp_type(Type.BUY_ORDER);
    request.setInvestor_id(investorID);
    request.setFundID(fundID);
    request.setFolio(folio);
    return request;
  }
}
