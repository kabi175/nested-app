package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;

public class SellOrderDetail {

  @JsonProperty("mf_investment_account")
  protected String accountID;

  @JsonProperty("scheme")
  @NotNull
  protected String fundID;

  @JsonProperty("folio_number")
  protected String folio;

  private double amount;
}
