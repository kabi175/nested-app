package com.nested.app.client.mf.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Valid
@Builder
public class BulkOrderRequest {
  @NotNull @NotNull @NotEmpty private String auth_ref;

  @NotNull
  @Size(min = 1)
  private List<OrderDetail> detail;
}
