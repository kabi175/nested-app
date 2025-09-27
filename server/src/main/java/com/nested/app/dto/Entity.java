package com.nested.app.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Entity<T> {
    private List<T> data;
    private int count;

    public Entity(List<T> data) {
        this.data = data;
        this.count = data.size();
    }

  public static <T> Entity<T> of(List<T> data) {
    return new Entity<>(data);
  }
}
