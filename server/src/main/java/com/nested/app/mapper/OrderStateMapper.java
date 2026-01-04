package com.nested.app.mapper;

import com.nested.app.client.mf.dto.OrderData;
import com.nested.app.enums.TransactionStatus;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

/**
 * Mapper for converting between OrderData.OrderState and TransactionStatus enums. Maps the external
 * MF order states to internal transaction status states.
 */
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class OrderStateMapper {

  /**
   * Converts OrderData.OrderState to TransactionStatus.
   *
   * <p>Mapping logic: - CREATED, UNDER_REVIEW, PENDING -> VERIFICATION_PENDING (order awaiting
   * verification) - CONFIRMED, SUBMITTED -> SUBMITTED (order submitted to exchange) - SUCCESSFUL ->
   * COMPLETED (order successfully executed) - FAILED, CANCELLED -> FAILED (order failed or
   * cancelled) - REVERSED -> REFUNDED (order reversed/refunded)
   *
   * @param orderState the order state from external MF API
   * @return the corresponding transaction status, or null if input is null
   * @throws IllegalArgumentException if the order state cannot be mapped
   */
  public static TransactionStatus toTransactionStatus(OrderData.OrderState orderState) {
    if (orderState == null) {
      return null;
    }

    return switch (orderState) {
      case CREATED, UNDER_REVIEW, PENDING -> TransactionStatus.VERIFICATION_PENDING;
      case CONFIRMED, SUBMITTED -> TransactionStatus.SUBMITTED;
      case SUCCESSFUL -> TransactionStatus.COMPLETED;
      case FAILED, CANCELLED -> TransactionStatus.FAILED;
      case REVERSED -> TransactionStatus.REFUNDED;
    };
  }
}
