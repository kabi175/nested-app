package com.nested.app.controllers;

import com.nested.app.context.UserContext;
import com.nested.app.dto.ChildDTO;
import com.nested.app.dto.Entity;
import com.nested.app.services.ChildService;
import io.swagger.v3.oas.annotations.Operation;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for managing Child entities Provides endpoints for CRUD operations on children
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/children")
@RequiredArgsConstructor
@Tag(name = "Children", description = "API endpoints for managing children")
public class ChildController {

  private final ChildService childService;
  private final UserContext userContext;

  /**
   * Retrieves all children
   *
   * @return ResponseEntity containing list of all children
   */
  @GetMapping
  @Operation(
      summary = "Get all children",
      description = "Retrieves a list of all children in the system")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved children",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<Entity<ChildDTO>> getAllChildren() {
    log.info("GET /api/v1/children - Retrieving all children");

    try {
      var user = userContext.getUser();
      List<ChildDTO> children = childService.getAllChildren(user);
      log.info("Successfully retrieved {} children", children.size());

      return ResponseEntity.ok(Entity.of(children));

    } catch (Exception e) {
      log.error("Error retrieving children: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * Creates a new child
   *
   * @param request Request body containing child data
   * @return ResponseEntity containing the created child
   */
  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  @Operation(
      summary = "Create a new child",
      description = "Creates a new child with the provided information")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "Child created successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> createChild(@Valid @RequestBody Entity<ChildDTO> request) {
    log.info("POST /api/v1/children - Creating new child");
    try {
      var user = userContext.getUser();
      List<ChildDTO> createdChildren = childService.createChildren(request.getData(), user);

      log.info("Successfully created {} children", createdChildren.size());

      return ResponseEntity.status(HttpStatus.CREATED).body(Entity.of(createdChildren));

    } catch (IllegalArgumentException e) {
      log.warn("Validation error creating child: {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.<String, Object>of("error", e.getMessage()));
    } catch (Exception e) {
      log.error("Error creating child: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  /**
   * Updates an existing child
   *
   * @param request Request body containing updated child data
   * @return ResponseEntity containing the updated child
   */
  @PutMapping
  @Operation(
      summary = "Update an existing child",
      description = "Updates an existing child with the provided information")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Child updated successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Child not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> updateChild(@Valid @RequestBody Entity<ChildDTO> request) {

    log.info("PUT /api/v1/children - Updating child");

    try {
      var user = userContext.getUser();
      List<ChildDTO> updatedChildren = childService.updateChildren(request.getData(), user);
      log.info("Successfully updated {} children", updatedChildren.size());

      return ResponseEntity.ok(Entity.of(updatedChildren));

    } catch (IllegalArgumentException e) {
      log.warn("Validation error updating child: {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.<String, Object>of("error", e.getMessage()));
    } catch (Exception e) {
      log.error("Error updating child: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }
}
