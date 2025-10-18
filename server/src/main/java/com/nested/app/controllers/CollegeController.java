package com.nested.app.controllers;

import java.util.List;
import java.util.Map;

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

import com.nested.app.annotation.AdminOnly;
import com.nested.app.dto.CollegeDTO;
import com.nested.app.dto.Entity;
import com.nested.app.services.CollegeService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST Controller for managing College entities
 * Provides endpoints for CRUD operations on colleges
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/colleges")
@RequiredArgsConstructor
@Tag(name = "Colleges", description = "API endpoints for managing colleges and educational institutions")
public class CollegeController {

    private final CollegeService collegeService;

    /**
     * Retrieves all colleges
     *
     * @return ResponseEntity containing list of colleges
     */
    @GetMapping
    @Operation(summary = "Get all colleges", description = "Retrieves all colleges and educational institutions")
    @ApiResponses(
        value = {
          @ApiResponse(
              responseCode = "200",
              description = "Successfully retrieved colleges",
              content =
                  @Content(
                      mediaType = "application/json",
                      schema = @Schema(implementation = Map.class))),
          @ApiResponse(responseCode = "500", description = "Internal server error")
        })
    public ResponseEntity<Entity<CollegeDTO>> getAllColleges() {
        log.info("GET /api/v1/colleges - Retrieving all colleges");

        try {
            List<CollegeDTO> colleges = collegeService.getAllColleges();
            log.info("Successfully retrieved {} colleges", colleges.size());
            return ResponseEntity.ok(Entity.of(colleges));
        } catch (Exception e) {
            log.error("Error retrieving colleges: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Retrieves college details by ID
     * 
     * @param id The ID of the college
     * @return ResponseEntity containing college details
     */
    @GetMapping("/{id}")
    @Operation(
        summary = "Get college details by ID",
        description = "Retrieves detailed information about a specific college"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved college details",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Map.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "College not found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Map.class)
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error"
        )
    })
    public ResponseEntity<?> getCollegeById(
            @Parameter(description = "College ID", required = true)
            @PathVariable String id) {
        
        log.info("GET /api/v1/colleges/{} - Retrieving college details", id);
        
        try {
            CollegeDTO college = collegeService.getCollegeById(id);
            if (college == null) {
                log.warn("College not found with ID: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.<String, Object>of("error", "College not found"));
            }
            
            log.info("Successfully retrieved college details for ID: {}", id);
            return ResponseEntity.ok(Entity.of(List.of(college)));

        } catch (Exception e) {
            log.error("Error retrieving college with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Creates a new college (Admin only)
     *
     * @param request Request body containing college data
     * @return ResponseEntity containing created college
     */
    @PostMapping
    @Operation(
        summary = "Create a new college",
        description = "Creates a new college or educational institution (Admin only)")
    @ApiResponses(
        value = {
          @ApiResponse(
              responseCode = "201",
              description = "College created successfully",
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
    public ResponseEntity<?> createCollege(
        @Parameter(description = "College data", required = true) @Valid @RequestBody @AdminOnly
            Entity<CollegeDTO> request) {

        log.info("POST /api/v1/colleges - Creating new college");

        try {
            List<CollegeDTO> colleges = collegeService.createColleges(request.getData());
            log.info("Successfully created {} colleges", colleges.size());
            return ResponseEntity.status(HttpStatus.CREATED).body(Entity.of(colleges));

        } catch (IllegalArgumentException e) {
            log.warn("Validation error creating college: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.<String, Object>of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating college: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Updates an existing college (Admin only)
     *
     * @param request Request body containing college data
     * @return ResponseEntity containing updated college
     */
    @PatchMapping
    @Operation(
        summary = "Update an existing college",
        description = "Updates an existing college or educational institution (Admin only)")
    @ApiResponses(
        value = {
          @ApiResponse(
              responseCode = "200",
              description = "College updated successfully",
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
          @ApiResponse(responseCode = "404", description = "College not found"),
          @ApiResponse(responseCode = "500", description = "Internal server error")
        })
    public ResponseEntity<?> updateCollege(
        @Parameter(description = "College data", required = true) @Valid @RequestBody @AdminOnly
            Entity<CollegeDTO> request) {

        log.info("PATCH /api/v1/colleges - Updating college");

        try {
            List<CollegeDTO> colleges = collegeService.updateColleges(request.getData());
            log.info("Successfully updated {} colleges", colleges.size());
            return ResponseEntity.ok(Entity.of(colleges));

        } catch (IllegalArgumentException e) {
            log.warn("Validation error updating college: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.<String, Object>of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating college: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Deletes a college (Admin only)
     *
     * @param request Request body containing college data
     * @return ResponseEntity containing deleted college
     */
    @DeleteMapping
    @Operation(summary = "Delete a college", description = "Deletes a college or educational institution (Admin only)")
    @ApiResponses(
        value = {
          @ApiResponse(
              responseCode = "200",
              description = "College deleted successfully",
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
          @ApiResponse(responseCode = "404", description = "College not found"),
          @ApiResponse(responseCode = "500", description = "Internal server error")
        })
    public ResponseEntity<?> deleteCollege(
        @Parameter(description = "College data", required = true) @Valid @RequestBody @AdminOnly
            Entity<CollegeDTO> request) {

        log.info("DELETE /api/v1/colleges - Deleting college");

        try {
            List<CollegeDTO> colleges = collegeService.deleteColleges(request.getData());
            log.info("Successfully deleted {} colleges", colleges.size());
            return ResponseEntity.ok(Entity.of(colleges));

        } catch (Exception e) {
            log.error("Error deleting college: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

