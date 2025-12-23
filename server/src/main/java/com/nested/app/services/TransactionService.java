package com.nested.app.services;

import com.nested.app.dto.TransactionDTO;
import com.nested.app.entity.User;
import java.util.List;
import org.springframework.data.domain.Pageable;

/**
 * Service interface for managing Transaction entities Provides business logic for
 * transaction-related operations
 *
 * @author Nested App Team
 * @version 1.0
 */
public interface TransactionService {

  /**
   * Retrieves all transactions for the current user with optional date range filtering
   *
   * @param startDate Optional start date in yyyy-MM-dd format
   * @param endDate Optional end date in yyyy-MM-dd format
   * @param pageable Pagination parameters
   * @param user Current user context
   * @return List of transactions matching the criteria
   */
  List<TransactionDTO> getAllTransactions(
      String startDate, String endDate, Pageable pageable, User user);
}
