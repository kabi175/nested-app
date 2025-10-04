package com.nested.app.dto;

import java.sql.Date;
import java.sql.Timestamp;
import lombok.Data;

/**
 * Data Transfer Object for Order entity
 * Used for API requests and responses to transfer order data
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Data
public class OrderDTO {
  
  private Long id;
  private Date orderDate;
  private Double amount;
  private String type;
  private String status;
  private Long fundId;
  private Double monthlySip;
  private Long userId;
  private Long goalId;
  private String folio;
  private Timestamp createdAt;
  private Timestamp updatedAt;
}
