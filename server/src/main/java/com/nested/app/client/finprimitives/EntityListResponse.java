package com.nested.app.client.finprimitives;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
public class EntityListResponse<T> {
  @Getter public List<T> data;
}
