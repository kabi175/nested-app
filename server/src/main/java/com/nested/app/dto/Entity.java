package com.nested.app.dto;

import java.util.List;

public class Entity<T> {
    private List<T> data;
    private int count;

    public Entity(List<T> data) {
        this.data = data;
        this.count = data.size();
    }
}
