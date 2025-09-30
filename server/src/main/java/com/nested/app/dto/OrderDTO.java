package com.nested.app.dto;

import java.time.LocalDate;
import lombok.Data;

@Data
public class OrderDTO {
  private String id;
  private LocalDate orderDate;
  private Double amount;
  private String type;
  private String status;
  private FundDTO fund;
  private Double monthlySip;
  private MinifiedUserDTO user;
}
