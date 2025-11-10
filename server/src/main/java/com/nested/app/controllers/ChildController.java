package com.nested.app.controllers;

import com.nested.app.dto.ChildDTO;
import com.nested.app.dto.Entity;
import com.nested.app.dto.PlaceOrderDTO;
import com.nested.app.dto.VerifyOrderDTO;
import com.nested.app.entity.Investor;
import com.nested.app.services.ChildService;
import com.nested.app.services.InvestorServiceTImpl;
import com.nested.app.services.PaymentService;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
  private final PaymentService paymentService;
  private final InvestorServiceTImpl investorService;

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
      List<ChildDTO> children = childService.getAllChildren();
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
      List<ChildDTO> createdChildren = childService.createChildren(request.getData());

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
      List<ChildDTO> updatedChildren = childService.updateChildren(request.getData());
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

  /**
   * Verifies a payment
   *
   * @param childId Child ID (for context, not used in verification)
   * @param verifyOrderRequest Payment verification request data
   * @return ResponseEntity containing verified payment data
   */
  @PostMapping("/{child_id}/actions/verifiy_order")
  @Operation(
      summary = "Verify placed orders",
      description = "Verifies a payment using the provided verification code")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Payment verified successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid verification code or payment not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> verifyOrder(
      @PathVariable("child_id") Long childId,
      @Valid @RequestBody VerifyOrderDTO verifyOrderRequest) {

    log.info("POST /api/v1/children/{}/actions/verifiy_order - Verifying payment", childId);

    try {
      PlaceOrderDTO verifiedPayment = paymentService.verifyPayment(verifyOrderRequest);

      log.info(
          "Successfully verified payment with verification code: {}",
          verifyOrderRequest.getVerificationCode());

      return ResponseEntity.ok(verifiedPayment);

    } catch (IllegalArgumentException e) {
      log.warn("Validation error verifying payment: {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.<String, Object>of("error", e.getMessage()));
    } catch (Exception e) {
      log.error("Error verifying payment: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
  }

  @PostMapping("/{child_id}/actions/create_investor")
  @Operation(
      summary = "Create investor for child",
      description =
          "Creates an investor profile in Tarrakki for the specified child (minor type)")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "Investor created successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input data or missing required fields"),
        @ApiResponse(responseCode = "404", description = "Child not found"),
        @ApiResponse(responseCode = "409", description = "Investor already exists for this child"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> createInvestorForChild(
      @Parameter(description = "Child ID", required = true) @PathVariable("child_id")
          Long childId) {

    log.info(
        "POST /api/v1/children/{}/actions/create_investor - Creating investor for child", childId);

    try {
      Investor investor = investorService.createInvestorForChild(childId);

      log.info(
          "Successfully created investor for child ID: {} with Tarrakki ref: {}",
          childId,
          investor.getRef());

      return ResponseEntity.status(HttpStatus.CREATED)
          .body(
              Map.of(
                  "message",
                  "Investor created successfully",
                  "investor_id",
                  investor.getId(),
                  "ref",
                  investor.getRef(),
                  "investor_type",
                  investor.getType(),
                  "status",
                  investor.getStatus()));

    } catch (IllegalArgumentException e) {
      log.warn("Validation error creating investor for child {}: {}", childId, e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST)
          .body(Map.of("error", e.getMessage()));
    } catch (IllegalStateException e) {
      log.warn("State error creating investor for child {}: {}", childId, e.getMessage());
      return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      log.error("Error creating investor for child {}: {}", childId, e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(Map.of("error", "Failed to create investor: " + e.getMessage()));
    }
  }
}
