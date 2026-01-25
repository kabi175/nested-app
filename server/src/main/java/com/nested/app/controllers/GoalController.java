package com.nested.app.controllers;

import com.nested.app.context.UserContext;
import com.nested.app.dto.Entity;
import com.nested.app.dto.GoalCreateDTO;
import com.nested.app.dto.GoalDTO;
import com.nested.app.dto.GoalUpdateDTO;
import com.nested.app.dto.HoldingDTO;
import com.nested.app.dto.OrderDTO;
import com.nested.app.enums.BasketType;
import com.nested.app.services.GoalService;
import com.nested.app.services.HoldingService;
import com.nested.app.services.OrderService;
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
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for managing Goal entities Provides endpoints for CRUD operations on goals and
 * related operations
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/goals")
@RequiredArgsConstructor
@Tag(name = "Goals", description = "API endpoints for managing investment goals")
public class GoalController {

  private final GoalService goalService;
  private final HoldingService holdingService;
  private final OrderService orderService;
  private final UserContext userContext;

  /**
   * Retrieves all goals
   *
   * @return ResponseEntity containing list of all goals
   */
  @GetMapping
  @Operation(
      summary = "Get all goals",
      description = "Retrieves a list of all investment goals in the system")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved goals",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<Entity<GoalDTO>> getAllGoals(@RequestParam BasketType type) {
    log.info("GET /api/v1/goals - Retrieving all goals");

    try {
      List<GoalDTO> goals = goalService.getAllGoals(userContext.getUser(), type);
      log.info("Successfully retrieved {} goals", goals.size());

      return ResponseEntity.ok(Entity.of(goals));

    } catch (Exception e) {
      log.error("Error retrieving goals: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @GetMapping("/{goalId}")
  public ResponseEntity<Entity<GoalDTO>> getGoalById(@PathVariable Long goalId) {
    GoalDTO goal = goalService.getGoalById(goalId, userContext.getUser());
    log.info("Successfully retrieved goal with ID {}", goalId);

    if (goal == null) {
      return ResponseEntity.noContent().build();
    }

    return ResponseEntity.ok(Entity.of(List.of(goal)));
  }

  /**
   * Creates a new goal
   *
   * @param requestBody Request body containing goal data
   * @return ResponseEntity containing the created goal
   */
  @PostMapping
  @Operation(
      summary = "Create a new goal",
      description = "Creates a new investment goal with the provided information")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "Goal created successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<Entity<GoalDTO>> createGoal(
      @RequestBody Entity<GoalCreateDTO> requestBody) {

    log.info("POST /api/v1/goals - Creating new goal");

    try {
      if (requestBody.getData() == null || requestBody.getData().isEmpty()) {
        log.warn("Invalid request body: missing or empty data array");
        return ResponseEntity.badRequest().build();
      }
      List<GoalDTO> goalData =
          requestBody.getData().stream().map(GoalCreateDTO::toGoalDTO).toList();

      List<GoalDTO> createdGoals = goalService.createGoals(goalData, userContext.getUser());
      log.info("Successfully created {} goals", createdGoals.size());

      return ResponseEntity.status(HttpStatus.CREATED).body(Entity.of(createdGoals));

    } catch (Exception e) {
      log.error("Error creating goal: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * Updates an existing goal
   *
   * @param requestBody Request body containing updated goal data
   * @return ResponseEntity containing the updated goal
   */
  @PutMapping
  @Operation(
      summary = "Update an existing goal",
      description = "Updates an existing investment goal with the provided information")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Goal updated successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Goal not found"),
        @ApiResponse(
            responseCode = "409",
            description = "Cannot update goal when an order exists for this goal",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> updateGoal(@RequestBody Entity<GoalUpdateDTO> requestBody) {

    log.info("PUT /api/v1/goals - Updating goal");

    try {
      if (requestBody == null || requestBody.getData().isEmpty()) {
        log.warn("Invalid request body: missing or empty data array");
        return ResponseEntity.badRequest().build();
      }
      List<GoalDTO> goalData =
          requestBody.getData().stream().map(GoalUpdateDTO::toGoalDTO).toList();

      List<GoalDTO> updatedGoals = goalService.updateGoals(goalData, userContext.getUser());
      log.info("Successfully updated {} goals", updatedGoals.size());

      return ResponseEntity.ok(Map.of("data", updatedGoals));

    } catch (IllegalStateException e) {
      log.warn("Cannot update goal: {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.CONFLICT)
          .body(Map.<String, Object>of("error", e.getMessage()));

    } catch (Exception e) {
      log.error("Error updating goal: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * Retrieves holdings for a specific goal
   *
   * @param goalId The ID of the goal
   * @return ResponseEntity containing list of holdings for the goal
   */
  @GetMapping("/{goalId}/holdings")
  @Operation(
      summary = "Get holdings for a goal",
      description = "Retrieves all holdings associated with a specific investment goal")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved holdings",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "404", description = "Goal not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<Map<String, List<HoldingDTO>>> getGoalHoldings(
      @Parameter(description = "Goal ID", required = true) @PathVariable String goalId) {

    log.info("GET /api/v1/goals/{}/holdings - Retrieving holdings for goal", goalId);

    try {
      List<HoldingDTO> holdings = holdingService.getHoldingsByGoalId(goalId);
      log.info("Successfully retrieved {} holdings for goal {}", holdings.size(), goalId);

      return ResponseEntity.ok(Map.of("data", holdings));

    } catch (Exception e) {
      log.error("Error retrieving holdings for goal {}: {}", goalId, e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * Retrieves orders for a specific goal
   *
   * @param goalId The ID of the goal
   * @return ResponseEntity containing list of orders for the goal
   */
  @GetMapping("/{goalId}/orders")
  @Operation(
      summary = "Get orders for a goal",
      description = "Retrieves all orders associated with a specific investment goal")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved orders",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "404", description = "Goal not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<Map<String, List<OrderDTO>>> getGoalOrders(
      @Parameter(description = "Goal ID", required = true) @PathVariable String goalId) {

    log.info("GET /api/v1/goals/{}/orders - Retrieving orders for goal", goalId);

    try {
      List<OrderDTO> orders = orderService.getOrdersByGoalId(goalId, userContext.getUser());
      log.info("Successfully retrieved {} orders for goal {}", orders.size(), goalId);

      return ResponseEntity.ok(Map.of("data", orders));

    } catch (Exception e) {
      log.error("Error retrieving orders for goal {}: {}", goalId, e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @GetMapping("/{goal_id}/orders/pending")
  public ResponseEntity<?> fetchPending(@PathVariable("goal_id") Long goalId) {
    List<OrderDTO> fetchedOrders = orderService.getPendingOrders(goalId, userContext.getUser());
    return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("data", fetchedOrders));
  }

  /**
   * Retrieves goals by basket name
   *
   * @param basketName The exact name of the basket to search for
   * @return ResponseEntity containing list of goals for the basket, or 204 No Content if no goals
   *     found
   */
  @GetMapping("/by-basket/{basketName}")
  @Operation(
      summary = "Get goals by basket name",
      description = "Retrieves all goals associated with a specific basket using exact name match")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved goals",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "204", description = "No goals found for the specified basket"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<Map<String, List<GoalDTO>>> getGoalsByBasketName(
      @Parameter(description = "Exact basket name", required = true) @PathVariable
          String basketName) {

    log.info("GET /api/v1/goals/by-basket/{} - Retrieving goals for basket", basketName);

    try {
      List<GoalDTO> goals = goalService.getGoalsByBasketName(basketName, userContext.getUser());
      log.info("Successfully retrieved {} goals for basket: {}", goals.size(), basketName);

      if (goals.isEmpty()) {
        log.info("No goals found for basket name: {}", basketName);
        return ResponseEntity.noContent().build();
      }

      return ResponseEntity.ok(Map.of("data", goals));

    } catch (Exception e) {
      log.error("Error retrieving goals for basket {}: {}", basketName, e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }
}
