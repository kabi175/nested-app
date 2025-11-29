package com.nested.app.controllers;

import com.nested.app.dto.GoalHoldingDTO;
import com.nested.app.dto.PortfolioGoalDTO;
import com.nested.app.dto.PortfolioOverallDTO;
import com.nested.app.dto.TransactionDTO;
import com.nested.app.services.PortfolioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/portfolio")
@RequiredArgsConstructor
@Tag(name = "Portfolio", description = "API endpoints for portfolio aggregation and analytics")
public class PortfolioController {

  private final PortfolioService portfolioService;

  @GetMapping("/overall")
  public ResponseEntity<PortfolioOverallDTO> overall() {
    return ResponseEntity.ok(portfolioService.getOverallPortfolio());
  }

  @GetMapping("/goals/{goalId}")
  public ResponseEntity<PortfolioGoalDTO> goal(@PathVariable Long goalId) {
    var dto = portfolioService.getGoalPortfolio(goalId);
    if (dto == null) return ResponseEntity.notFound().build();
    return ResponseEntity.ok(dto);
  }

  /**
   * Retrieves transactions for a specific goal with pagination
   *
   * @param goalId The ID of the goal
   * @param pageable Pagination parameters (page, size, sort)
   * @return ResponseEntity containing list of transactions for the goal
   */
  @GetMapping("/goals/{goalId}/transactions")
  @Operation(
      summary = "Get transactions for a goal",
      description =
          "Retrieves all transactions associated with a specific investment goal, sorted by execution date descending with pagination support")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved transactions",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<Map<String, List<TransactionDTO>>> getGoalTransactions(
      @Parameter(description = "Goal ID", required = true) @PathVariable Long goalId,
      @PageableDefault(sort = "executedAt", direction = Sort.Direction.DESC, size = 20)
          Pageable pageable) {

    log.info(
        "GET /api/v1/portfolio/goals/{}/transactions - Retrieving transactions for goal", goalId);

    try {
      List<TransactionDTO> transactions = portfolioService.getGoalTransactions(goalId, pageable);
      log.info("Successfully retrieved {} transactions for goal {}", transactions.size(), goalId);

      return ResponseEntity.ok(Map.of("data", transactions));

    } catch (Exception e) {
      log.error("Error retrieving transactions for goal {}: {}", goalId, e.getMessage(), e);
      return ResponseEntity.ok(Map.of("data", List.of()));
    }
  }

  /**
   * Retrieves fund-wise holdings for a specific goal
   *
   * @param goalId The ID of the goal
   * @return ResponseEntity containing list of holdings aggregated by fund for the goal
   */
  @GetMapping("/goals/{goalId}/holdings")
  @Operation(
      summary = "Get holdings for a goal",
      description =
          "Retrieves fund-wise holdings for a specific investment goal with allocation percentage, invested amount, current value, and returns")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved holdings",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<Map<String, List<GoalHoldingDTO>>> getGoalHoldings(
      @Parameter(description = "Goal ID", required = true) @PathVariable Long goalId) {

    log.info("GET /api/v1/portfolio/goals/{}/holdings - Retrieving holdings for goal", goalId);

    try {
      List<GoalHoldingDTO> holdings = portfolioService.getGoalHoldings(goalId);
      log.info("Successfully retrieved {} holdings for goal {}", holdings.size(), goalId);

      return ResponseEntity.ok(Map.of("data", holdings));

    } catch (Exception e) {
      log.error("Error retrieving holdings for goal {}: {}", goalId, e.getMessage(), e);
      return ResponseEntity.ok(Map.of("data", List.of()));
    }
  }
}
