package com.nested.app.dto;

import java.util.List;
import lombok.Data;

@Data
public class BasketDTO {
  private String id;
  private String title;
  private List<BasketFundDTO> funds;
}
