package com.nested.app.controllers;

import com.nested.app.context.UserContext;
import com.nested.app.dto.PendingActivityResponseDTO;
import com.nested.app.entity.User;
import com.nested.app.enums.ActivityPriority;
import com.nested.app.enums.ActivityType;
import com.nested.app.services.PendingActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/users")
@Tag(name = "Pending Activities", description = "APIs for user pending activities management")
public class PendingActivityController {

  private final PendingActivityService pendingActivityService;
  private final UserContext userContext;

  @GetMapping(value = "/{userId}/pending-activities", produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(
      summary = "Get pending activities for a user",
      description =
          "Retrieves all pending activities for a user such as incomplete KYC, pending goal payments, etc.")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved pending activities",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = PendingActivityResponseDTO.class))),
        @ApiResponse(
            responseCode = "403",
            description = "Access denied - User can only access their own pending activities"),
        @ApiResponse(responseCode = "404", description = "User not found")
      })
  public ResponseEntity<PendingActivityResponseDTO> getPendingActivities(
      @Parameter(description = "User ID", required = true) @PathVariable Long userId,
      @Parameter(description = "Filter by activity type (optional)") @RequestParam(required = false)
          ActivityType type,
      @Parameter(description = "Filter by priority (optional)") @RequestParam(required = false)
          ActivityPriority priority) {
    log.info(
        "Fetching pending activities for user: {}, type: {}, priority: {}", userId, type, priority);

    // Security check: Users can only access their own pending activities
    User currentUser = userContext.getUser();
    if (currentUser != null
        && !currentUser.getId().equals(userId)
        && currentUser.getRole() != User.Role.ADMIN) {
      log.warn(
          "User {} attempted to access pending activities for user {}",
          currentUser.getId(),
          userId);
      return ResponseEntity.status(403).build();
    }

    PendingActivityResponseDTO response =
        pendingActivityService.getPendingActivities(userId, type, priority);

    log.info(
        "Found {} pending activities for user {}", response.getSummary().getTotalCount(), userId);

    return ResponseEntity.ok(response);
  }

  @GetMapping(value = "/me/pending-activities", produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(
      summary = "Get pending activities for current user",
      description = "Retrieves all pending activities for the currently authenticated user")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved pending activities",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = PendingActivityResponseDTO.class))),
        @ApiResponse(responseCode = "401", description = "User not authenticated")
      })
  public ResponseEntity<PendingActivityResponseDTO> getMyPendingActivities(
      @Parameter(description = "Filter by activity type (optional)") @RequestParam(required = false)
          ActivityType type,
      @Parameter(description = "Filter by priority (optional)") @RequestParam(required = false)
          ActivityPriority priority) {
    User currentUser = userContext.getUser();
    if (currentUser == null) {
      log.warn("Unauthenticated request to get pending activities");
      return ResponseEntity.status(401).build();
    }

    log.info("Fetching pending activities for current user: {}", currentUser.getId());

    PendingActivityResponseDTO response =
        pendingActivityService.getPendingActivities(currentUser.getId(), type, priority);

    log.info("Found {} pending activities for current user", response.getSummary().getTotalCount());

    return ResponseEntity.ok(response);
  }
}
