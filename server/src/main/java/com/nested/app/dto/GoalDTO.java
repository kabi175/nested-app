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

  @JsonFormat(shape = JsonFormat.Shape.STRING)
  private Long id;

  private String title;

  @JsonProperty("target_amount")
  private Double targetAmount;

  @JsonProperty("current_amount")
  private Double currentAmount;

  @JsonProperty("invested_amount")
  private Double investedAmount;

  @JsonProperty("monthly_sip")
  private Double monthlySip;

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

  public static GoalDTO fromEntity(Goal goal) {
    if (goal == null) {
      return null;
    }
    GoalDTO dto = new GoalDTO();
    dto.setId(goal.getId());
    dto.setTitle(goal.getTitle());
    dto.setTargetAmount(goal.getTargetAmount());
    dto.setCurrentAmount(goal.getCurrentAmount());
    dto.setInvestedAmount(goal.getInvestedAmount());
    if (goal.getCurrentAmount() == 0) {
      dto.setCurrentAmount(goal.getInvestedAmount());
    }
    dto.setMonthlySip(goal.getMonthlySip());
    dto.setTargetDate(goal.getTargetDate());
    dto.setStatus(goal.getStatus());
    dto.setCreatedAt(goal.getCreatedAt());
    dto.setUpdatedAt(goal.getUpdatedAt());

    // Nested objects (minified)
    if (goal.getBasket() != null) {
      dto.setBasket(MinifiedBasketDto.fromEntity(goal.getBasket()));
    }
    if (goal.getEducation() != null) {
      MinifiedEducationDto educationDto = new MinifiedEducationDto();
      educationDto.setId(goal.getEducation().getId());
      dto.setEducation(educationDto);
    }
    if (goal.getUser() != null) {
      dto.setUser(MinifiedUserDTO.fromEntity(goal.getUser()));
    }
    if (goal.getChild() != null) {
      dto.setChild(MinifiedChildDTO.fromEntity(goal.getChild()));
    }

    return dto;
  }
}
