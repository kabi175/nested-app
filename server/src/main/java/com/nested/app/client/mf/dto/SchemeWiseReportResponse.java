package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import java.math.BigDecimal;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonDeserialize(using = SchemeWiseReportDeserializer.class)
public class SchemeWiseReportResponse {

  private List<SchemeWiseReport> rows;
  private List<String> columns;

  @lombok.Data
  @NoArgsConstructor
  @AllArgsConstructor
  public static class SchemeWiseReport {
    @JsonProperty("isin")
    private String isin;

    @JsonProperty("scheme_name")
    private String schemeName;

    @JsonProperty("plan_type")
    private String planType;

    @JsonProperty("investment_option")
    private String investmentOption;

    @JsonProperty("as_on")
    private String asOn;

    @JsonProperty("nav")
    private BigDecimal nav;

    @JsonProperty("invested_amount")
    private BigDecimal investedAmount;

    @JsonProperty("current_value")
    private BigDecimal currentValue;

    @JsonProperty("unrealized_gain")
    private BigDecimal unrealizedGain;

    @JsonProperty("absolute_return")
    private BigDecimal absoluteReturn;

    @JsonProperty("average_buying_value")
    private BigDecimal averageBuyingValue;

    @JsonProperty("units")
    private BigDecimal units;

    @JsonProperty("xirr")
    private BigDecimal xirr;
  }
}
