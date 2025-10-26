package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

@Data
public class MinifiedOrderDTO {
  @JsonFormat(shape = JsonFormat.Shape.STRING)
  public Long id;
}
