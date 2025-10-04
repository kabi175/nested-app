package com.nested.app.dto;

import java.sql.Timestamp;
import lombok.Data;

/**
 * Data Transfer Object for Holding entity
 * Used for API requests and responses to transfer holding data
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Data
public class HoldingDTO {
  
  private Long id;
  private Double units;
  private Double investedAmount;
  private Double currentValue;
  private Long orderId;
  private Double orderAllocationPercentage;
  private Long goalId;
  private Long fundId;
  private Long userId;
  private Long childId;
  private Timestamp createdAt;
  private Timestamp updatedAt;
}
