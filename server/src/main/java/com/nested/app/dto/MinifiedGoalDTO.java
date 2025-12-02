package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.nested.app.entity.Goal;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for minified Goal entity Used for API requests and responses where only
 * basic goal information is needed
 *
 * @author Nested App Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MinifiedGoalDTO {
  @JsonFormat(shape = JsonFormat.Shape.STRING)
  private Long id;

  @JsonInclude(JsonInclude.Include.NON_NULL)
  private String name;

  public static MinifiedGoalDTO fromEntity(Goal goal) {
    return new MinifiedGoalDTO(goal.getId(), goal.getTitle());
  }
}
