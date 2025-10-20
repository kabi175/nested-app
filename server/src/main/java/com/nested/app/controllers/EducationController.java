package com.nested.app.controllers;

import com.nested.app.annotation.AdminOnly;
import com.nested.app.dto.EducationDTO;
import com.nested.app.dto.Entity;
import com.nested.app.entity.Education;
import com.nested.app.services.EducationService;
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
import java.util.stream.Collectors;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for managing Education entities
 * Provides endpoints for CRUD operations on education records
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/education")
@RequiredArgsConstructor
@Tag(name = "Education", description = "API endpoints for managing education records (colleges and courses)")
public class EducationController {

    private final EducationService educationService;

  /**
   * Retrieves all education records
   *
   * @return ResponseEntity containing list of education records
   */
  @GetMapping
  @AdminOnly
  @Operation(
      summary = "Get all education records (Admin only)",
      description = "Retrieves all colleges and courses")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved education records",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "403", description = "Access denied - Admin role required"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<Entity<EducationDTO>> getAllEducation(
      @RequestParam(required = false) Education.Type type) {
        log.info("GET /api/v1/education - Retrieving all education records");

        try {
      List<EducationDTO> education = educationService.getAllEducation(type);
            log.info("Successfully retrieved {} education records", education.size());
            return ResponseEntity.ok(Entity.of(education));
        } catch (Exception e) {
            log.error("Error retrieving education records: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Retrieves education record by ID
     * 
     * @param id The ID of the education record
     * @return ResponseEntity containing education details
     */
    @GetMapping("/{id}")
    @AdminOnly
    @Operation(
        summary = "Get education record by ID (Admin only)",
        description = "Retrieves detailed information about a specific education record")
    @ApiResponses(
        value = {
          @ApiResponse(
              responseCode = "200",
              description = "Successfully retrieved education record",
              content =
                  @Content(
                      mediaType = "application/json",
                      schema = @Schema(implementation = Map.class))),
          @ApiResponse(responseCode = "403", description = "Access denied - Admin role required"),
          @ApiResponse(responseCode = "404", description = "Education record not found"),
          @ApiResponse(responseCode = "500", description = "Internal server error")
        })
    public ResponseEntity<?> getEducationById(
        @Parameter(description = "ID of the education record", required = true) @PathVariable Long id) {
        log.info("GET /api/v1/education/{} - Retrieving education record details", id);

        try {
            EducationDTO education = educationService.getEducationById(id);
            return ResponseEntity.ok(Entity.of(List.of(education)));
        } catch (IllegalArgumentException e) {
            log.warn("Education record not found with id: {}", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.<String, Object>of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error retrieving education record: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Creates new education records (Admin only)
     *
     * @param request Request body containing education data
     * @return ResponseEntity containing created education records
     */
    @PostMapping
    @Operation(
        summary = "Create new education records",
        description = "Creates one or more education records (Admin only)")
    @ApiResponses(
        value = {
          @ApiResponse(
              responseCode = "201",
              description = "Education records created successfully",
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
    public ResponseEntity<?> createEducation(
        @Parameter(description = "Education data", required = true) @Valid @RequestBody @AdminOnly
            Entity<EducationDTO> request) {

        log.info("POST /api/v1/education - Creating new education records");

        try {
            List<EducationDTO> education = educationService.createEducation(request.getData());
            log.info("Successfully created {} education records", education.size());
            return ResponseEntity.status(HttpStatus.CREATED).body(Entity.of(education));

        } catch (IllegalArgumentException e) {
            log.warn("Validation error creating education record: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.<String, Object>of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error creating education record: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Updates existing education records (Admin only)
     *
     * @param request Request body containing education data
     * @return ResponseEntity containing updated education records
     */
    @PatchMapping
    @Operation(
        summary = "Update existing education records",
        description = "Updates one or more education records (Admin only)")
    @ApiResponses(
        value = {
          @ApiResponse(
              responseCode = "200",
              description = "Education records updated successfully",
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
          @ApiResponse(responseCode = "404", description = "Education record not found"),
          @ApiResponse(responseCode = "500", description = "Internal server error")
        })
    public ResponseEntity<?> updateEducation(
        @Parameter(description = "Education data", required = true) @Valid @RequestBody @AdminOnly
            Entity<EducationDTO> request) {

        log.info("PATCH /api/v1/education - Updating education records");

        try {
            List<EducationDTO> education = educationService.updateEducation(request.getData());
            log.info("Successfully updated {} education records", education.size());
            return ResponseEntity.ok(Entity.of(education));

        } catch (IllegalArgumentException e) {
            log.warn("Validation error updating education record: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.<String, Object>of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error updating education record: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Deletes education records (Admin only)
     *
     * @param request Request body containing education IDs
     * @return ResponseEntity containing deleted education records
     */
    @DeleteMapping
    @Operation(summary = "Delete education records",
        description = "Deletes one or more education records (Admin only)")
    @ApiResponses(
        value = {
          @ApiResponse(
              responseCode = "200",
              description = "Education records deleted successfully",
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
          @ApiResponse(responseCode = "404", description = "Education record not found"),
          @ApiResponse(responseCode = "500", description = "Internal server error")
        })
    public ResponseEntity<?> deleteEducation(
        @Parameter(description = "Education IDs to delete", required = true) @Valid @RequestBody @AdminOnly
            Entity<Map<String, Long>> request) {
        log.info("DELETE /api/v1/education - Deleting education records");

        try {
            List<Long> ids = request.getData().stream()
                .map(map -> map.get("id"))
                .collect(Collectors.toList());
            
            List<EducationDTO> deletedEducation = educationService.deleteEducation(ids);
            log.info("Successfully deleted {} education records", deletedEducation.size());
            return ResponseEntity.ok(Entity.of(deletedEducation));

        } catch (IllegalArgumentException e) {
            log.warn("Validation error deleting education record: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.<String, Object>of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error deleting education record: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

