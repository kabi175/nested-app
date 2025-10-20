package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

/**
 * Data Transfer Object for Education entity
 * Used for API requests and responses to transfer education data
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Data
public class EducationDTO {
  @JsonFormat(shape = JsonFormat.Shape.STRING)
  private Long id;

  private String name; // College name or Course name
  private String type; // INSTITUTION or COURSE
  private String country;
  private Double lastYearFee;
  private Double expectedFee;
  private Double expectedIncreasePercentLt10Yr; // Expected % increase for < 10 years
  private Double expectedIncreasePercentGt10Yr; // Expected % increase for > 10 years
}

