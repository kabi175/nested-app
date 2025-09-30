package com.nested.app.dto;

import lombok.Data;

@Data
public class FundDTO {
  private String id;
  private String code;
  private String name;
  private String displayName;
  private String description;
  private Double minAmount;
  private Double nav;
  private boolean isActive;
}
