package com.nested.app.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nested.app.annotation.AdminOnly;
import com.nested.app.dto.Entity;
import com.nested.app.dto.FundDTO;
import com.nested.app.services.FundService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST Controller for managing Fund entities
 * Provides endpoints for retrieving fund information
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/funds")
@RequiredArgsConstructor
@Tag(name = "Funds", description = "API endpoints for managing investment funds")
public class FundController {

  private final FundService fundService;

  /**
   * Retrieves all funds
   *
   * @param pageable Pagination information
   * @param activeOnly Filter for active funds only
   * @return ResponseEntity containing list of funds
   */
  @GetMapping
  @AdminOnly
  @Operation(summary = "Get all funds (Admin only)", description = "Retrieves all investment funds with pagination")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved funds",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "403", description = "Access denied - Admin role required"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<Entity<FundDTO>> getAllFunds(
      @PageableDefault(sort = "id", size = 100) Pageable pageable,
      @RequestParam(required = false, defaultValue = "false") boolean activeOnly) {
    
    log.info("GET /api/v1/funds - Retrieving {} funds", activeOnly ? "active" : "all");

    try {
      List<FundDTO> funds = activeOnly 
          ? fundService.getActiveFunds(pageable)
          : fundService.getAllFunds(pageable);
      
      log.info("Successfully retrieved {} funds", funds.size());
      return ResponseEntity.ok(Entity.of(funds));
      
    } catch (Exception e) {
      log.error("Error retrieving funds: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * Retrieves fund details by ID
   * 
   * @param id The ID of the fund
   * @return ResponseEntity containing fund details
   */
  @GetMapping("/{id}")
  @AdminOnly
  @Operation(
      summary = "Get fund details by ID (Admin only)",
      description = "Retrieves detailed information about a specific fund")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved fund details",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "403", description = "Access denied - Admin role required"),
        @ApiResponse(responseCode = "404", description = "Fund not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> getFundById(
      @Parameter(description = "Fund ID", required = true) @PathVariable Long id) {

    log.info("GET /api/v1/funds/{} - Retrieving fund details", id);

    try {
      FundDTO fund = fundService.getFundById(id);
      return ResponseEntity.ok(Entity.of(List.of(fund)));
      
    } catch (IllegalArgumentException e) {
      log.warn("Fund not found with ID: {}", id);
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.<String, Object>of("error", e.getMessage()));
    } catch (Exception e) {
      log.error("Error retrieving fund with ID {}: {}", id, e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }
}

