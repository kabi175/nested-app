package com.nested.app.dto;

import java.sql.Timestamp;
import java.util.List;

import lombok.Data;

/**
 * Data Transfer Object for Basket entity Used for API requests and responses to transfer basket
 * data
 *
 * @author Nested App Team
 * @version 1.0
 */
@Data
public class BasketDTO {
  private Long id;
  private String title;
  private Double years;
  private List<BasketFundDTO> funds;
  private Timestamp createdAt;
  private Timestamp updatedAt;

  @Data
  public static class BasketFundDTO {
    private Long fundId;
    private Double allocationPercentage;
  }
}
