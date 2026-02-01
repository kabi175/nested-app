package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import java.sql.Date;
import lombok.Data;

/**
 * Data Transfer Object for Goal entity Used for API requests and responses to transfer goal data
 *
 * @author Nested App Team
 * @version 1.0
 */
@Data
public class GoalUpdateDTO {
  private Long id;
  private String title;

  @JsonProperty("target_amount")
  private Double targetAmount;

  @JsonProperty("current_amount")
  private Double currentAmount;

  @NotEmpty
  @JsonProperty("target_date")
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  private Date targetDate;

  private MinifiedEducationDto education;

  public static GoalDTO toGoalDTO(GoalUpdateDTO createDTO) {
    GoalDTO dto = new GoalDTO();
    dto.setId(createDTO.getId());
    dto.setTitle(createDTO.getTitle());
    dto.setTargetAmount(createDTO.getTargetAmount());
    dto.setCurrentAmount(createDTO.getCurrentAmount());
    dto.setTargetDate(createDTO.getTargetDate());
    dto.setEducation(createDTO.getEducation());
    return dto;
  }
}
