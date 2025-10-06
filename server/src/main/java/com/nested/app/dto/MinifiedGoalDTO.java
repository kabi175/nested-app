package com.nested.app.dto;

import lombok.Data;

/**
 * Data Transfer Object for minified Goal entity Used for API requests and responses where only
 * basic goal information is needed
 *
 * @author Nested App Team
 * @version 1.0
 */
@Data
public class MinifiedGoalDTO {
  private Long id;
}
