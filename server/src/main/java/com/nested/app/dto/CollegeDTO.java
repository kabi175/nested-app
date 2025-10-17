package com.nested.app.dto;

import java.sql.Timestamp;

import lombok.Data;

/**
 * Data Transfer Object for College entity
 * Used for API requests and responses to transfer college data
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Data
public class CollegeDTO {
  
  private Long id;
  private String name;
  private String location;
  private Double fees;
  private String course;
  private Integer duration;
  private String type;
  private Timestamp createdAt;
  private Timestamp updatedAt;
}

