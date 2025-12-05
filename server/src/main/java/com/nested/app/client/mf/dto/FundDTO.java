package com.nested.app.client.mf.dto;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;
import lombok.Data;

@Data
public class FundDTO {
  private String gateway;

  private String isin;

  private String type;

  private boolean active;

  @JsonIgnore private String schemeName;

  @JsonIgnore private double minAmountBuy;
  @JsonIgnore private double maxAmountBuy;
  @JsonIgnore private double buyAmountMultiplier;

  @JsonIgnore private double minUnitsSell;
  @JsonIgnore private double maxUnitsSell;
  @JsonIgnore private double sellUnitsMultiplier;

  @JsonIgnore private double minSipAmount;
  @JsonIgnore private double maxSipAmount;
  @JsonIgnore private double sipAmountMultiplier;

  @JsonProperty("thresholds")
  public void setThresholds(List<Map<String, Object>> thresholds) {
    if (thresholds == null) return;
    for (Map<String, Object> threshold : thresholds) {
      String type = (String) threshold.get("type");
      if (type == null) continue;
      switch (type) {
        case "lumpsum":
          if (threshold.get("amount_min") != null)
            minAmountBuy = Double.parseDouble(threshold.get("amount_min").toString());
          if (threshold.get("amount_max") != null)
            maxAmountBuy = Double.parseDouble(threshold.get("amount_max").toString());
          if (threshold.get("amount_multiples") != null)
            buyAmountMultiplier = Double.parseDouble(threshold.get("amount_multiples").toString());
          break;
        case "withdrawal":
          if (threshold.get("units_min") != null)
            minUnitsSell = Double.parseDouble(threshold.get("units_min").toString());
          if (threshold.get("units_max") != null)
            maxUnitsSell = Double.parseDouble(threshold.get("units_max").toString());
          if (threshold.get("units_multiples") != null)
            sellUnitsMultiplier = Double.parseDouble(threshold.get("units_multiples").toString());
          if (threshold.get("amount_min") != null)
            minAmountBuy = Double.parseDouble(threshold.get("amount_min").toString());
          if (threshold.get("amount_max") != null)
            maxAmountBuy = Double.parseDouble(threshold.get("amount_max").toString());
          if (threshold.get("amount_multiples") != null)
            buyAmountMultiplier = Double.parseDouble(threshold.get("amount_multiples").toString());
          break;
        case "sip":
          if (threshold.get("amount_min") != null)
            minSipAmount = Double.parseDouble(threshold.get("amount_min").toString());
          if (threshold.get("amount_max") != null)
            maxSipAmount = Double.parseDouble(threshold.get("amount_max").toString());
          if (threshold.get("amount_multiples") != null)
            sipAmountMultiplier = Double.parseDouble(threshold.get("amount_multiples").toString());
          break;
      }
    }
  }

  @JsonProperty("mf_scheme")
  public void setSchemeName(Map<String, String> obj) {
    schemeName = obj.get("name");
  }
}
