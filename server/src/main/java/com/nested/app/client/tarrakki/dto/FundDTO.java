package com.nested.app.client.tarrakki.dto;

import lombok.Data;

@Data
public class FundDTO {
  private String id;
  private String name;
  private String category;
  private String sub_category;
  private String amc_id;
  private String amc;
  private String scheme_type;
  private Double aum = 0.0;
  private Double return_6_mth = 0.0;
  private Double return_1_yr = 0.0;
  private Double return_3_yr = 0.0;
  private Double min_initial = 0.0;
  private Double min_additional = 0.0;
  private Double nav = 0.0;
  private String nav_date;
  private String isin;
  private String amfi_code;
  private String plan;
  private String nfo_close_date;
  private String status = "inactive";
  private String option;
}
