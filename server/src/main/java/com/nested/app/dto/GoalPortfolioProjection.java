package com.nested.app.dto;

/**
 * Projection interface for goal portfolio aggregated at the database level. Used to efficiently
 * retrieve goal-level portfolio metrics with a single SQL query.
 *
 * @author Nested App Team
 * @version 1.0
 */
public interface GoalPortfolioProjection {
  Long getGoalId();

  String getGoalTitle();

  Double getTargetAmount();

  Double getInvestedAmount();

  Double getCurrentValue();

  Double getTotalUnits();
}
