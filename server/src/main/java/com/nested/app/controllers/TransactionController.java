package com.nested.app.controllers;

import com.nested.app.context.UserContext;
import com.nested.app.dto.Entity;
import com.nested.app.dto.TransactionDTO;
import com.nested.app.services.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for managing Transaction entities Provides endpoints for querying transactions
 * with pagination and date filtering
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
@Tag(name = "Transactions", description = "API endpoints for managing and querying transactions")
public class TransactionController {

  private final TransactionService transactionService;
  private final UserContext userContext;

  /**
   * Retrieves all transactions for the authenticated user with optional date range filtering
   *
   * @param startDate Optional start date in yyyy-MM-dd format (inclusive)
   * @param endDate Optional end date in yyyy-MM-dd format (inclusive)
   * @param pageable Pagination parameters (page, size, sort)
   * @return ResponseEntity containing list of transactions
   */
  @GetMapping
  @Operation(
      summary = "Get all transactions",
      description =
          "Retrieves all transactions for the authenticated user with optional date range filtering on createdAt field. "
              + "Supports pagination and sorting. Default sort is by createdAt descending (newest first).")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved transactions",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Entity.class))),
        @ApiResponse(responseCode = "400", description = "Invalid date format provided"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<Entity<TransactionDTO>> getAllTransactions(
      @Parameter(
              description =
                  "Start date for filtering transactions (format: yyyy-MM-dd). "
                      + "If provided, returns transactions from this date onwards.",
              example = "2024-01-01")
          @RequestParam(name = "from_date", required = false)
          String startDate,
      @Parameter(
              description =
                  "End date for filtering transactions (format: yyyy-MM-dd). "
                      + "If provided, returns transactions up to this date.",
              example = "2024-12-31")
          @RequestParam(name = "to_date", required = false)
          String endDate,
      @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC, size = 20)
          Pageable pageable) {

    log.info(
        "GET /api/v1/transactions - Retrieving transactions with startDate: {}, endDate: {}, page: {}, size: {}",
        startDate,
        endDate,
        pageable.getPageNumber(),
        pageable.getPageSize());

    try {
      List<TransactionDTO> transactions =
          transactionService.getAllTransactions(
              startDate, endDate, pageable, userContext.getUser());
      log.info("Successfully retrieved {} transactions", transactions.size());

      return ResponseEntity.ok(Entity.of(transactions));

    } catch (IllegalArgumentException e) {
      log.error("Invalid request parameters: {}", e.getMessage());
      return ResponseEntity.badRequest().build();
    } catch (Exception e) {
      log.error("Error retrieving transactions: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError().build();
    }
  }
}
