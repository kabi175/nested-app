package com.nested.app.entity;

import jakarta.persistence.*;
import java.util.List;
import lombok.Data;

@Data
@Entity
@Table(name = "basket")
public class Basket {
  @Id private String id;

  @Column(nullable = false)
  private String title;

  @OneToMany(mappedBy = "basket", cascade = CascadeType.ALL)
  private List<BasketFund> funds;
}
