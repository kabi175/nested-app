package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioOverallDTO {
  @JsonProperty("invested_amount")
  private Double totalInvested; // sum of positive unit transactions

  @JsonProperty("current_amount")
  private Double totalCurrentValue; // holdings * current nav

  private Double totalUnits; // net units across all funds

  private Double totalRealized; // proceeds from sells (abs of negative unit txns)

  @JsonProperty("unrealized_gain")
  private Double totalUnrealizedGain; // currentValue - (cost basis of open units)

  @JsonProperty("return_percentage")
  private Double returnPercentage; // (currentValue - invested)/invested

  private List<PortfolioGoalDTO> goals; // breakdown
}
