package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Data Transfer Object for Goal soft delete operation Contains the goal to delete and the mandatory
 * target goal for transferring records
 *
 * @author Nested App Team
 * @version 1.0
 */
@Data
public class GoalDeleteDTO {

  @NotNull(message = "Transfer goal ID is required")
  @JsonProperty("transfer_to_goal_id")
  private Long transferToGoalId;
}
