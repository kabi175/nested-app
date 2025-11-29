package com.nested.app.dto;

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
  private Long id;
  private String fundLabel;
  private TransactionType type;
  private Double units;
  private Double unitPrice;
  private Double amount;
  private Timestamp executedAt;
}
