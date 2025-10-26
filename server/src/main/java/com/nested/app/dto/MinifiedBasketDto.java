package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MinifiedBasketDto {
  @JsonFormat(shape = JsonFormat.Shape.STRING)
  private Long id;
}
