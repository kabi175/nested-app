package com.nested.app.controllers;

import com.nested.app.contect.UserContext;
import com.nested.app.dto.Entity;
import com.nested.app.dto.NomineeRequestDTO;
import com.nested.app.dto.NomineeResponseDTO;
import com.nested.app.entity.User;
import com.nested.app.services.NomineeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for managing Nominee operations Provides endpoints for CRUD operations on
 * nominees and opt-out functionality
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "Nominees", description = "API endpoints for managing nominees")
public class NomineeController {

  private final NomineeService nomineeService;
  private final UserContext userContext;

  /**
   * Upsert nominees for the current user (create or update all at once)
   *
   * <p>All nominees must be sent in each request for complete validation. Validates total
   * allocation = 100% across all nominees.
   *
   * <p>Request format: - Nominee without "id" field: CREATE new - Nominee with existing "id":
   * UPDATE existing
   *
   * <p>Constraints: - Maximum 3 nominees per user - Total allocation must equal 100% - Name and
   * relationship are immutable (cannot be changed on update) - For minors: guardianName and
   * guardianPan are required
   *
   * @param request List of all nominees to create/update
   * @return ResponseEntity with all saved nominees
   */
  @PostMapping(
      path = "/nominees",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(
      tags = "nominees",
      summary = "Upsert nominees",
      description =
          "Create or update all nominees at once. All nominees must be sent each time for validation. Max 3 per user, total allocation = 100%")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Nominees saved successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Entity.class))),
        @ApiResponse(
            responseCode = "400",
            description =
                "Invalid request - validation error (exceeds limit, invalid allocation, missing guardian info, etc.)"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<Entity<NomineeResponseDTO>> upsertNominees(
      @Valid @RequestBody Entity<NomineeRequestDTO> request) {
    var nomineeDTOs = request.getData();
    log.info("POST /api/v1/users/nominees - Upserting nominees (count: {})", nomineeDTOs.size());
      User user = userContext.getUser();
      List<NomineeResponseDTO> response = nomineeService.upsertNominees(nomineeDTOs, user);
      log.info("Nominees upserted successfully: {} total", response.size());
      return ResponseEntity.ok(Entity.of(response));
  }

  /**
   * Get all nominees for the current user
   *
   * @return ResponseEntity with list of nominees
   */
  @GetMapping(path = "/nominees", produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(
      tags = "nominees",
      summary = "Get all nominees",
      description = "Retrieve all nominees for the current user")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved nominees",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Entity.class))),
        @ApiResponse(responseCode = "204", description = "No nominees found"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> getNominees() {
    log.info("GET /api/v1/users/nominees - Fetching all nominees");

    try {
      User user = userContext.getUser();
      List<NomineeResponseDTO> nominees = nomineeService.getNominees(user);

      if (nominees.isEmpty()) {
        log.info("No nominees found for user: {}", user.getId());
        return ResponseEntity.noContent().build();
      }

      log.info("Retrieved {} nominees for user: {}", nominees.size(), user.getId());
      return ResponseEntity.ok(Entity.of(nominees));
    } catch (Exception e) {
      log.error("Error fetching nominees: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "Failed to fetch nominees"));
    }
  }

  /**
   * Get a specific nominee by ID
   *
   * @param nomineeId The nominee ID
   * @return ResponseEntity with nominee details
   */
  @GetMapping(path = "/nominees/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(
      tags = "nominees",
      summary = "Get nominee by ID",
      description = "Retrieve a specific nominee by ID for the current user")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved nominee",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = NomineeResponseDTO.class))),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "404", description = "Nominee not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> getNominee(@PathVariable(name = "id") Long nomineeId) {
    log.info("GET /api/v1/users/nominees/{} - Fetching nominee", nomineeId);

    try {
      User user = userContext.getUser();
      NomineeResponseDTO nominee = nomineeService.getNominee(nomineeId, user);
      log.info("Retrieved nominee with ID: {}", nomineeId);
      return ResponseEntity.ok(Entity.of(Collections.singletonList(nominee)));
    } catch (IllegalArgumentException e) {
      log.warn("Nominee not found: {}", e.getMessage());
      return ResponseEntity.notFound().build();
    } catch (Exception e) {
      log.error("Error fetching nominee: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "Failed to fetch nominee"));
    }
  }

  /**
   * Opt out from nominee process
   *
   * <p>Updates user's NomineeStatus to OPT_OUT
   *
   * @return ResponseEntity with success message
   */
  @PostMapping(path = "/actions/nominee-opt-out", produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(
      tags = "nominees",
      summary = "Opt out from nominee process",
      description = "User can opt out from the nominee process")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Successfully opted out"),
        @ApiResponse(responseCode = "401", description = "Unauthorized"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> optOutNominee() {
    log.info("POST /api/v1/users/actions/nominee-opt-out - Opting out from nominee");

    try {
      User user = userContext.getUser();
      nomineeService.optOutNominee(user);
      log.info("User {} opted out from nominee process", user.getId());
      return ResponseEntity.ok(Map.of("message", "Successfully opted out from nominee process"));
    } catch (Exception e) {
      log.error("Error opting out from nominee: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "Failed to opt out from nominee process"));
    }
  }
}
