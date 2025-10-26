package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

@Data
public class MinifiedUserDTO {
  @JsonFormat(shape = JsonFormat.Shape.STRING)
  private Long id;

  private String name;

  public static MinifiedUserDTO fromEntity(com.nested.app.entity.User user) {
    MinifiedUserDTO dto = new MinifiedUserDTO();
    dto.setId(user.getId());
    dto.setName(user.getFirstName());
    return dto;
  }
}
