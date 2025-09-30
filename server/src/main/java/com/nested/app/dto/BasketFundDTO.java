package com.nested.app.dto;

import lombok.Data;

@Data
public class BasketFundDTO {
  private FundDTO fund;
  private Double allocationPercentage;
}
