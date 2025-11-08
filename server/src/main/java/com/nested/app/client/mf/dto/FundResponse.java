package com.nested.app.client.mf.dto;

import java.util.List;
import lombok.Data;

@Data
public class FundResponse {
  private int count;
  private List<FundDTO> results;
  private String next;
  private String previous;

  public boolean hasNext() {
    return next != null && !next.isEmpty();
  }

  public boolean hasPrevious() {
    return previous != null && !previous.isEmpty();
  }
}
