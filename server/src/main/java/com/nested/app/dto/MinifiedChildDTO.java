package com.nested.app.dto;

import com.nested.app.entity.Child;
import lombok.Data;

@Data
public class MinifiedChildDTO {
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
