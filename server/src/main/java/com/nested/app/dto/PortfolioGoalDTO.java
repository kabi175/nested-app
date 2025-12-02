package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioGoalDTO {
  private MinifiedGoalDTO goal;

  @JsonProperty("invested_amount")
  private Double investedAmount;

  @JsonProperty("current_amount")
  private Double currentValue;

  private Double units;

  @JsonProperty("progress_percentage")
  private Double progressPercentage; // currentValue / targetAmount

  @JsonProperty("allocation_percentage")
  private Double allocationPercentage; // goal current value / total current value
}
