package com.nested.app.client.tarrakki.dto;

import java.util.List;
import lombok.Data;

@Data
public class FundResponse {
  private int count;
  private List<FundDTO> results;
  private String next;
  private String previous;
}
