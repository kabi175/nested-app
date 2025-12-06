package com.nested.app.client.finprimitives;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
public class EntityResponse<T> {
  public T data;
}
