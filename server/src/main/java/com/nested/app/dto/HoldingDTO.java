package com.nested.app.dto;

import lombok.Data;

@Data
public class HoldingDTO {
  private String id;
  private Double units;
  private Double investedAmount;
  private Double currentValue;
  private OrderDTO order;
  private Double orderAllocationPercentage;
  private GoalDTO goal;
  private FundDTO fund;
  private MinifiedUserDTO user;
  private ChildDTO child;
}
