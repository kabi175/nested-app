package com.nested.app.controllers;

import com.nested.app.annotation.AdminOnly;
import com.nested.app.dto.BasketDTO;
import com.nested.app.dto.Entity;
import com.nested.app.services.BasketService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for managing Basket entities Provides endpoints for CRUD operations on baskets
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/bucket")
@RequiredArgsConstructor
@Tag(name = "Baskets", description = "API endpoints for managing investment baskets")
public class BasketController {

  private final BasketService basketService;

  /**
   * Retrieves all baskets
   *
   * @return ResponseEntity containing list of baskets
   */
  @GetMapping
  @AdminOnly
  @Operation(
      summary = "Get all baskets (Admin only)",
      description = "Retrieves all investment baskets")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved baskets",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "403", description = "Access denied - Admin role required"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<Entity<BasketDTO>> getAllBaskets() {
    log.info("GET /api/v1/bucket - Retrieving all baskets");

    try {
      List<BasketDTO> baskets = basketService.getAllBaskets();
      log.info("Successfully retrieved {} baskets", baskets.size());
      return ResponseEntity.ok(Entity.of(baskets));
    } catch (Exception e) {
      log.error("Error retrieving baskets: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * Retrieves basket details by ID
   *
   * @param id The ID of the basket
   * @return ResponseEntity containing basket details
   */
  @GetMapping("/{id}")
  @AdminOnly
  @Operation(
      summary = "Get basket details by ID (Admin only)",
      description = "Retrieves detailed information about a specific investment basket")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved basket details",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "403", description = "Access denied - Admin role required"),
        @ApiResponse(
            responseCode = "404",
            description = "Basket not found",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> getBasketById(
      @Parameter(description = "Basket ID", required = true) @PathVariable String id) {

    log.info("GET /api/v1/bucket/{} - Retrieving basket details", id);

    try {
      BasketDTO basket = basketService.getBasketById(id);
      if (basket == null) {
        log.warn("Basket not found with ID: {}", id);
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.<String, Object>of("error", "Basket not found"));
      }

      log.info("Successfully retrieved basket details for ID: {}", id);
      return ResponseEntity.ok(Entity.of(List.of(basket)));

    } catch (Exception e) {
      log.error("Error retrieving basket with ID {}: {}", id, e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * Retrieves basket details by name
   *
   * @param name The name (title) of the basket
   * @return ResponseEntity containing basket details
   */
  @GetMapping("/name/{name}")
  @Operation(
      summary = "Get basket details by name (Admin only)",
      description = "Retrieves detailed information about a specific investment basket by its name")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved basket details",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "403", description = "Access denied - Admin role required"),
        @ApiResponse(
            responseCode = "404",
            description = "Basket not found",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> getBasketByName(
      @Parameter(description = "Basket name (title)", required = true) @PathVariable String name) {

    log.info("GET /api/v1/bucket/name/{} - Retrieving basket details by name", name);

    try {
      BasketDTO basket = basketService.getBasketByName(name);
      if (basket == null) {
        log.warn("Basket not found with name: {}", name);
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(Map.<String, Object>of("error", "Basket not found"));
      }

      log.info("Successfully retrieved basket details for name: {}", name);
      return ResponseEntity.ok(basket);

    } catch (Exception e) {
      log.error("Error retrieving basket with name {}: {}", name, e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * Creates a new basket (Admin only)
   *
   * @param request Request body containing basket data
   * @return ResponseEntity containing created basket
   */
  @PostMapping
  @Operation(
      summary = "Create a new basket",
      description = "Creates a new investment basket (Admin only)")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "Basket created successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(
            responseCode = "403",
            description = "Access denied - Admin role required",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> createBasket(
      @Parameter(description = "Basket data", required = true) @Valid @RequestBody @AdminOnly
          BasketDTO request) {

    log.info("POST /api/v1/bucket - Creating new basket");

    try {
      BasketDTO baskets = basketService.createBasket(request);
      log.info("Successfully created {} baskets", baskets.getId());
      return ResponseEntity.status(HttpStatus.CREATED).body(baskets);

    } catch (IllegalArgumentException e) {
      log.warn("Validation error creating basket: {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.<String, Object>of("error", e.getMessage()));
    } catch (Exception e) {
      log.error("Error creating basket: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * Updates an existing basket (Admin only)
   *
   * @param request Request body containing basket data
   * @return ResponseEntity containing updated basket
   */
  @PatchMapping
  @Operation(
      summary = "Update an existing basket",
      description = "Updates an existing investment basket (Admin only)")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Basket updated successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(
            responseCode = "403",
            description = "Access denied - Admin role required",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Basket not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> updateBasket(
      @Parameter(description = "Basket data", required = true) @Valid @RequestBody @AdminOnly
          BasketDTO request) {

    log.info("PATCH /api/v1/bucket - Updating basket");

    try {
      BasketDTO baskets = basketService.updateBasket(request);
      log.info("Successfully updated the basket id: {} ", baskets.getId());
      return ResponseEntity.ok(baskets);

    } catch (IllegalArgumentException e) {
      log.warn("Validation error updating basket: {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.<String, Object>of("error", e.getMessage()));
    } catch (Exception e) {
      log.error("Error updating basket: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * Deletes a basket (Admin only)
   *
   * @param request Request body containing basket data
   * @return ResponseEntity containing deleted basket
   */
  @DeleteMapping
  @Operation(summary = "Delete a basket", description = "Deletes an investment basket (Admin only)")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Basket deleted successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(
            responseCode = "403",
            description = "Access denied - Admin role required",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Basket not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> deleteBasket(
      @Parameter(description = "Basket data", required = true) @Valid @RequestBody @AdminOnly
          Entity<BasketDTO> request) {

    log.info("DELETE /api/v1/bucket - Deleting basket");

    try {
      List<BasketDTO> baskets = basketService.deleteBaskets(request.getData());
      log.info("Successfully deleted {} baskets", baskets.size());
      return ResponseEntity.ok(Entity.of(baskets));

    } catch (Exception e) {
      log.error("Error deleting basket: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }
}
