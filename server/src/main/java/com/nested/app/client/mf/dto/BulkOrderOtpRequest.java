package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.Data;
import lombok.EqualsAndHashCode;

@EqualsAndHashCode(callSuper = true)
@Data
public class BulkOrderOtpRequest extends OtpRequest {
  List<Detail> detail;

  public static BulkOrderOtpRequest getInstance(String investorID, List<Detail> detailList) {
    BulkOrderOtpRequest request = new BulkOrderOtpRequest();
    request.setOtp_type(Type.BULK_ORDERS);
    request.setInvestor_id(investorID);
    request.detail = detailList;
    return request;
  }

  public static Detail getDetail(String fundID) {
    return getDetail(fundID, null);
  }

  public static Detail getDetail(String fundID, String folio) {
    return new Detail(fundID, folio);
  }

  public record Detail(@JsonProperty("fund_id") String fundID, String folio) {}
}
