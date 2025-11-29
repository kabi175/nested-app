package com.nested.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for goal-level fund holdings Represents aggregated holding information for a
 * fund within a specific goal
 *
 * @author Nested App Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class GoalHoldingDTO {

  private String fundLabel;
  private Double allocationPercentage; // Fund current value / total goal current value * 100
  private Double investedAmount; // Sum of positive transaction amounts for this fund
  private Double currentValue; // Units * current NAV
  private Double returnsAmount; // Current value - invested amount
}
