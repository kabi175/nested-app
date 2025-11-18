package com.nested.app.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioOverallDTO {
  private Double totalInvested; // sum of positive unit transactions
  private Double totalCurrentValue; // holdings * current nav
  private Double totalUnits; // net units across all funds
  private Double totalRealized; // proceeds from sells (abs of negative unit txns)
  private Double totalUnrealizedGain; // currentValue - (cost basis of open units)
  private Double returnPercentage; // (currentValue - invested)/invested
  private List<PortfolioGoalDTO> goals; // breakdown
}
