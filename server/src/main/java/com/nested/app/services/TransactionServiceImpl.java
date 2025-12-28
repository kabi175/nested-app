package com.nested.app.services;

import com.nested.app.dto.TransactionDTO;
import com.nested.app.entity.Transaction;
import com.nested.app.entity.User;
import com.nested.app.repository.TransactionRepository;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for managing Transaction entities Provides business logic for
 * transaction-related operations
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class TransactionServiceImpl implements TransactionService {

  private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
  private final TransactionRepository transactionRepository;

  /**
   * Retrieves all transactions for the current user with optional date range filtering
   *
   * @param startDate Optional start date in yyyy-MM-dd format
   * @param endDate Optional end date in yyyy-MM-dd format
   * @param pageable Pagination parameters
   * @param user Current user context
   * @return List of transactions matching the criteria
   */
  @Override
  @Transactional(readOnly = true)
  public List<TransactionDTO> getAllTransactions(
      String startDate, String endDate, Pageable pageable, User user) {
    if (user == null) {
      log.warn("No user found in context");
      return List.of();
    }

    Long userId = user.getId();
    Page<Transaction> transactionPage;

    try {
      // Check if date filtering is required
      if (startDate != null && endDate != null) {
        // Both dates provided - filter by date range
        Timestamp start = parseDate(startDate, true);
        Timestamp end = parseDate(endDate, false);
        log.info("Fetching transactions for user {} between {} and {}", userId, startDate, endDate);
        transactionPage =
            transactionRepository.findByUserIdAndCreatedAtBetween(userId, start, end, pageable);
      } else if (startDate != null) {
        // Only start date provided - from startDate onwards
        Timestamp start = parseDate(startDate, true);
        Timestamp end = Timestamp.valueOf("2999-12-31 23:59:59");
        log.info("Fetching transactions for user {} from {} onwards", userId, startDate);
        transactionPage =
            transactionRepository.findByUserIdAndCreatedAtBetween(userId, start, end, pageable);
      } else if (endDate != null) {
        // Only end date provided - up to endDate
        Timestamp start = Timestamp.valueOf("1970-01-01 00:00:00");
        Timestamp end = parseDate(endDate, false);
        log.info("Fetching transactions for user {} up to {}", userId, endDate);
        transactionPage =
            transactionRepository.findByUserIdAndCreatedAtBetween(userId, start, end, pageable);
      } else {
        // No date filtering
        log.info("Fetching all transactions for user {}", userId);
        transactionPage = transactionRepository.findByUserId(userId, pageable);
      }

      List<TransactionDTO> transactions =
          transactionPage.getContent().stream().map(this::convertToDTO).toList();

      log.info("Successfully retrieved {} transactions for user {}", transactions.size(), userId);
      return transactions;

    } catch (DateTimeParseException e) {
      log.error("Invalid date format provided: {}", e.getMessage());
      throw new IllegalArgumentException(
          "Invalid date format. Expected yyyy-MM-dd format. " + e.getMessage());
    } catch (Exception e) {
      log.error("Error retrieving transactions for user {}: {}", userId, e.getMessage(), e);
      throw new IllegalStateException("Error retrieving transactions: " + e.getMessage(), e);
    }
  }

  /**
   * Parses a date string in yyyy-MM-dd format to a Timestamp
   *
   * @param dateStr Date string in yyyy-MM-dd format
   * @param isStartOfDay If true, returns start of day (00:00:00), otherwise end of day (23:59:59)
   * @return Timestamp representing the parsed date
   */
  private Timestamp parseDate(String dateStr, boolean isStartOfDay) {
    LocalDate date = LocalDate.parse(dateStr, DATE_FORMATTER);
    if (isStartOfDay) {
      return Timestamp.valueOf(date.atStartOfDay());
    } else {
      return Timestamp.valueOf(date.atTime(23, 59, 59));
    }
  }

  /**
   * Converts a Transaction entity to a TransactionDTO
   *
   * @param transaction Transaction entity
   * @return TransactionDTO
   */
  private TransactionDTO convertToDTO(Transaction transaction) {
    return new TransactionDTO(
        transaction.getId(),
        transaction.getFund().getLabel(),
        transaction.getType(),
        transaction.getUnits(),
        transaction.getStatus(),
        transaction.getUnitPrice(),
        transaction.getAmount(),
        transaction.getCreatedAt());
  }
}
