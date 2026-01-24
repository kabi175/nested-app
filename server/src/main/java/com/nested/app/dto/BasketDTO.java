package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
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
  @JsonFormat(shape = JsonFormat.Shape.STRING)
  private Long id;

  private String title;
  private Double years;
  private Double expectedReturns; // Expected annual returns percentage
  private List<BasketFundDTO> funds;
  private Timestamp createdAt;
  private Timestamp updatedAt;

  @Data
  public static class BasketFundDTO {
    @JsonProperty("id")
    private Long fundId;

    private String name;
    private Double allocationPercentage;
  }
}
