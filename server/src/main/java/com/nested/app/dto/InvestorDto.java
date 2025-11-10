package com.nested.app.dto;

import com.nested.app.entity.Investor;
import lombok.Data;

@Data
public class InvestorDto {
  private Long id;

  public static InvestorDto fromEntity(Investor investor) {
    if (investor == null) {
      return null;
    }

    InvestorDto dto = new InvestorDto();
    dto.setId(investor.getId());
    return dto;
  }
}
