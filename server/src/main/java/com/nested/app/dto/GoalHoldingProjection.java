package com.nested.app.dto;

/**
 * Projection interface for goal holdings aggregated at the database level Used to efficiently
 * retrieve fund-wise holdings data with a single SQL query
 *
 * @author Nested App Team
 * @version 1.0
 */
public interface GoalHoldingProjection {
  Long getFundId();

  String getFundLabel();

  Double getTotalUnits();

  Double getInvestedAmount();

  Double getCurrentNav();

  Double getAverageNav();

  Double getCurrentValue();
}
