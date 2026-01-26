package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.entity.Basket;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MinifiedBasketDto {
  @JsonFormat(shape = JsonFormat.Shape.STRING)
  private Long id;

  private String title;

  @JsonProperty("min_investment")
  private Double minInvestment;

  @JsonProperty("min_sip")
  private Double minSIP;

  @JsonProperty("min_step_up")
  private Double minStepUp;

  public static MinifiedBasketDto fromEntity(Basket basket) {
    var minStepUp = 5000D;
    if (basket.getBasketFunds() != null) {
      minStepUp = Math.max(basket.getBasketFunds().size() * 100, 1000);
    }
    return new MinifiedBasketDto(
        basket.getId(),
        basket.getTitle(),
        basket.getMinInvestmentAmount(),
        basket.getMinSIPAmount(),
        minStepUp);
  }
}
