package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.Data;

@Data
public class SchemeResponse {
  private int count;

  @JsonProperty("scheme_plans")
  private List<FundDTO> results;

  private boolean last;

  private boolean first;

  public boolean hasNext() {
    return !last;
  }

  public boolean hasPrevious() {
    return !first;
  }
}
