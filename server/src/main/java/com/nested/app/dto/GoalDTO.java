package com.nested.app.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class GoalDTO {
  private String id;
  private String title;
  private Double targetAmount;
  private Double currentAmount;
  private LocalDate targetDate;
  private BasketDTO basket;
  private MinifiedUserDTO user;
  private ChildDTO child;
  private String status;
}
