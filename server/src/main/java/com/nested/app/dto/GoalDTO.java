package com.nested.app.dto;

import java.sql.Date;
import java.sql.Timestamp;
import lombok.Data;

/**
 * Data Transfer Object for Goal entity
 * Used for API requests and responses to transfer goal data
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Data
public class GoalDTO {
  
  private Long id;
  private String title;
  private Double targetAmount;
  private Double currentAmount;
  private Date targetDate;
  private Long basketId;
  private Long userId;
  private Long childId;
  private String status;
  private Timestamp createdAt;
  private Timestamp updatedAt;
}
