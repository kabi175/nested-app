package com.nested.app.client.finprimitives;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
public class EntityResponse<T> {
  private T data;
}
