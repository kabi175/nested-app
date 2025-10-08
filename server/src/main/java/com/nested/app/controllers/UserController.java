package com.nested.app.controllers;

import com.nested.app.dto.Entity;
import com.nested.app.dto.UserDTO;
import com.nested.app.entity.Investor;
import com.nested.app.services.InvestorServiceImpl;
import com.nested.app.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@Validated
@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/users")
@Tag(name = "User Management", description = "APIs for managing users")
public class UserController {

  private final UserService userService;
  private final InvestorServiceImpl investorService;

  @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<Entity<UserDTO>> getUsers(
      @RequestParam(defaultValue = "CURRENT_USER") UserService.Type type,
      @PageableDefault(sort = "id") Pageable pageable) {
    var users = userService.findAllUsers(type, pageable);
    if (users.isEmpty()) {
      return ResponseEntity.noContent().build();
    }
    return ResponseEntity.ok(Entity.of(users));
  }

  @PatchMapping(
      path = "/{id}",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<UserDTO> updateUser(
      @PathVariable Long id,
      @Validated @org.springframework.web.bind.annotation.RequestBody UserDTO userDTO) {
    userDTO.setId(id);
    UserDTO updatedUser = userService.updateUser(userDTO);
    return ResponseEntity.ok(updatedUser);
  }

  @PostMapping("/{user_id}/actions/create_investor")
  @Operation(
      summary = "Create investor for user",
      description =
          "Creates an investor profile in Tarrakki for the specified user (individual type)")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "Investor created successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data or missing required fields"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "409", description = "Investor already exists for this user"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> createInvestorForUser(
      @Parameter(description = "User ID", required = true) @PathVariable("user_id") Long userId) {

    log.info("POST /api/v1/users/{}/actions/create_investor - Creating investor for user", userId);

    try {
      Investor investor = investorService.createInvestorForUser(userId);

      log.info(
          "Successfully created investor for user ID: {} with Tarrakki ref: {}",
          userId,
          investor.getTarakkiInvestorRef());

      return ResponseEntity.status(HttpStatus.CREATED)
          .body(
              Map.of(
                  "message",
                  "Investor created successfully",
                  "investor_id",
                  investor.getId(),
                  "tarrakki_investor_ref",
                  investor.getTarakkiInvestorRef(),
                  "investor_type",
                  investor.getInvestorType(),
                  "status",
                  investor.getInvestorStatus()));

    } catch (IllegalArgumentException e) {
      log.warn("Validation error creating investor for user {}: {}", userId, e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", e.getMessage()));
    } catch (IllegalStateException e) {
      log.warn("State error creating investor for user {}: {}", userId, e.getMessage());
      return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      log.error("Error creating investor for user {}: {}", userId, e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "Failed to create investor: " + e.getMessage()));
    }
  }
}
