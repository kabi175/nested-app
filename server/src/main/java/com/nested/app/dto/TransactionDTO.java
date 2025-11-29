package com.nested.app.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.nested.app.enums.TransactionType;
import java.sql.Timestamp;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Data Transfer Object for Transaction entity Used for API responses to transfer transaction data
 *
 * @author Nested App Team
 * @version 1.0
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TransactionDTO {
  @JsonIgnore private Long id;

  @JsonProperty("fund")
  private String fundLabel;

  private TransactionType type;
  private Double units;

  @JsonProperty("unit_price")
  private Double unitPrice;

  private Double amount;

  @JsonProperty("executed_at")
  @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
  private Timestamp executedAt;
}
