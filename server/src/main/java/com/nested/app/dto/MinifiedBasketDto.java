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

  public static MinifiedBasketDto fromEntity(Basket basket) {
    return new MinifiedBasketDto(
        basket.getId(),
        basket.getTitle(),
        basket.getMinInvestmentAmount(),
        basket.getMinSIPAmount());
  }
}
