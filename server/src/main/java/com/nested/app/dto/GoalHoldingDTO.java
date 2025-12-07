package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.nested.app.serializer.OneDecimalDoubleSerializer;
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

  @JsonProperty("fund")
  private String fundLabel;

  @JsonFormat(shape = JsonFormat.Shape.STRING)
  @JsonProperty("fund_id")
  private long fundID;

  @JsonProperty("current_nav")
  private Double currentNav;

  @JsonProperty("average_nav")
  private Double averageNav;

  @JsonProperty("total_units")
  private Double totalUnits;

  @JsonSerialize(using = OneDecimalDoubleSerializer.class)
  @JsonProperty("allocation_percentage")
  private Double allocationPercentage; // Fund current value / total goal current value * 100

  @JsonSerialize(using = OneDecimalDoubleSerializer.class)
  @JsonProperty("invested_amount")
  private Double investedAmount; // Sum of positive transaction amounts for this fund

  @JsonSerialize(using = OneDecimalDoubleSerializer.class)
  @JsonProperty("current_value")
  private Double currentValue; // Units * current NAV

  @JsonProperty("returns_amount")
  private Double returnsAmount; // Current value - invested amount
}
