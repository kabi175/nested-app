package com.nested.app.client.tarrakki.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
  @NotNull @NotEmpty private String investor_id;

  @Builder.Default private String authenticator = "tarrakki";
  @NotNull @NotEmpty private String auth_ref;

  @NotNull
  @NotEmpty
  @JsonProperty("investor_ip")
  private String investorIP;

  @NotNull
  @Size(min = 1)
  private List<OrderDetail> detail;
}
