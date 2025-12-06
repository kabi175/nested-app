package com.nested.app.dto;

/**
 * Projection interface for order allocation percentages aggregated at the database level Used to
 * efficiently retrieve fund-wise allocation data across multiple orders with a single SQL query
 *
 * @author Nested App Team
 * @version 1.0
 */
public interface OrderAllocationProjection {
  String getFundName();

  Double getAllocationPercent();
}
