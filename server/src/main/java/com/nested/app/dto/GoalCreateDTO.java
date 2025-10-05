package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.entity.Education;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.sql.Date;
import lombok.Data;

/**
 * Data Transfer Object for Goal entity Used for API requests and responses to transfer goal data
 *
 * @author Nested App Team
 * @version 1.0
 */
@Data
public class GoalCreateDTO {
  private String title;

  @JsonProperty("target_amount")
  private Double targetAmount;

  @JsonProperty("current_amount")
  private Double currentAmount;

  @NotNull private Education education;

  @NotEmpty
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  @JsonProperty("target_date")
  private Date targetDate;

  @NotEmpty private MinifiedChildDTO child;

  public static GoalDTO toGoalDTO(GoalCreateDTO createDTO) {
    GoalDTO dto = new GoalDTO();
    dto.setTitle(createDTO.getTitle());
    dto.setTargetAmount(createDTO.getTargetAmount());
    dto.setCurrentAmount(createDTO.getCurrentAmount());
    dto.setTargetDate(createDTO.getTargetDate());
    dto.setChild(createDTO.getChild());
    dto.setEducation(createDTO.getEducation());
    return dto;
  }
}
