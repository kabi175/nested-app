package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
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
}
