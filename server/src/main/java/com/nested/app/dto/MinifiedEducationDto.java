package com.nested.app.dto;

import com.nested.app.entity.Education;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MinifiedEducationDto {
  private Long id;

  public Education toEntity() {
    Education education = new Education();
    education.setId(this.id);
    return education;
  }
}
