package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.entity.Goal;
import jakarta.validation.constraints.NotEmpty;
import java.sql.Date;
import java.sql.Timestamp;
import lombok.Data;

/**
 * Data Transfer Object for Goal entity Used for API requests and responses to transfer goal data
 *
 * @author Nested App Team
 * @version 1.0
 */
@Data
public class GoalDTO {

  private Long id;
  private String title;

  @JsonProperty("target_amount")
  private Double targetAmount;

  @JsonProperty("current_amount")
  private Double currentAmount;

  @NotEmpty
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  @JsonProperty("target_date")
  private Date targetDate;

  private MinifiedBasketDto basket;

  private MinifiedEducationDto education;

  private MinifiedUserDTO user;

  private MinifiedChildDTO child;

  private Goal.Status status;

  private Timestamp createdAt;

  private Timestamp updatedAt;
}
