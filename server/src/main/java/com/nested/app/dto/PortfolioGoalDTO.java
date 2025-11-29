package com.nested.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioGoalDTO {
  private MinifiedGoalDTO goal;
  private Double investedAmount;
  private Double currentValue;
  private Double units;
  private Double progressPercentage; // currentValue / targetAmount
  private Double allocationPercentage; // goal current value / total current value
}
