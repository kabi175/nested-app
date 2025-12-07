package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SellOrderDetail {
  @JsonProperty("mf_investment_account")
  protected String accountID;

  @JsonProperty("scheme")
  @NotNull
  protected String fundID;

  @JsonProperty("folio_number")
  protected String folio;

  @JsonInclude(JsonInclude.Include.NON_NULL)
  @JsonProperty("id")
  private String ref;

  @JsonProperty("user_ip")
  private String userIP;

  private double amount;
}
