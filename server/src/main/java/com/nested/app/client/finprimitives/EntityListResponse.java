package com.nested.app.client.finprimitives;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
public class EntityListResponse<T> {
  public List<T> data;
}
