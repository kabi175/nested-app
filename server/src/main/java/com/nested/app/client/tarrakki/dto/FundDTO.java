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
  private Double aum;
  private Double return_6_mth;
  private Double return_1_yr;
  private Double return_3_yr;
  private Double min_initial;
  private Double min_additional;
  private Double nav;
  private String nav_date;
  private String isin;
  private String amfi_code;
  private String plan;
  private String nfo_close_date;
  private String status;
  private String option;
}
