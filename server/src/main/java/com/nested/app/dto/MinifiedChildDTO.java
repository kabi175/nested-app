package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.nested.app.entity.Child;
import lombok.Data;

@Data
public class MinifiedChildDTO {
  @JsonFormat(shape = JsonFormat.Shape.STRING)
  private Long id;

  private String name;

  public static MinifiedChildDTO fromEntity(Child child) {
    MinifiedChildDTO dto = new MinifiedChildDTO();
    dto.setId(child.getId());
    dto.setName(child.getFirstName());
    return dto;
  }

  public Child toEntity() {
    Child child = new Child();
    child.setId(this.id);
    child.setFirstName(this.name);
    return child;
  }
}
