package com.nested.app.dto;

import com.nested.app.entity.Investor;
import lombok.Data;

@Data
public class InvestorDto {
  private Long id;
  private Investor.Status status;

  public static InvestorDto fromEntity(Investor investor) {
    if (investor == null) {
      return null;
    }

    InvestorDto dto = new InvestorDto();
    dto.setId(investor.getId());
    dto.setStatus(investor.getStatus());
    return dto;
  }

  public Investor toEntity() {
    Investor investor = new Investor();
    investor.setId(this.getId());
    investor.setStatus(this.getStatus());
    return investor;
  }
}
