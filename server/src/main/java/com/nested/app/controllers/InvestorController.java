package com.nested.app.controllers;

import com.nested.app.dto.Entity;
import com.nested.app.dto.InvestorDto;
import com.nested.app.entity.Investor;
import com.nested.app.services.InvestorService;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Investor management operations Provides comprehensive CRUD operations for
 * investor entities
 */
@Slf4j
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/investors")
@Tag(name = "Investor Management", description = "APIs for managing investors")
public class InvestorController {

  private final InvestorService investorService;

  /** Get investor by ID */
  @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(summary = "Get investor by ID", description = "Retrieves investor information by ID")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Investor found",
            content = @Content(schema = @Schema(implementation = InvestorDto.class))),
        @ApiResponse(responseCode = "404", description = "Investor not found")
      })
  public ResponseEntity<InvestorDto> getInvestorById(
      @Parameter(description = "Investor ID", required = true) @PathVariable Long id) {

    log.debug("Fetching investor with ID: {}", id);
    InvestorDto investor = investorService.getInvestorById(id);
    return ResponseEntity.ok(investor);
  }

  /** Get investor with full details by ID */
  @GetMapping(value = "/{id}/details", produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(
      summary = "Get investor with full details",
      description = "Retrieves investor information with addresses and bank details")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Investor found with details",
            content = @Content(schema = @Schema(implementation = InvestorDto.class))),
        @ApiResponse(responseCode = "404", description = "Investor not found")
      })
  public ResponseEntity<InvestorDto> getInvestorWithDetails(
      @Parameter(description = "Investor ID", required = true) @PathVariable Long id) {

    log.debug("Fetching investor with details for ID: {}", id);
    InvestorDto investor = investorService.getInvestorWithDetails(id);
    return ResponseEntity.ok(investor);
  }

  /** Update investor by ID */
  @PutMapping(
      value = "/{id}",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(summary = "Update investor", description = "Updates investor information by ID")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "Investor updated successfully",
            content = @Content(schema = @Schema(implementation = InvestorDto.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Investor not found"),
        @ApiResponse(
            responseCode = "409",
            description = "Email, client code, or PAN already exists")
      })
  public ResponseEntity<InvestorDto> updateInvestor(
      @Parameter(description = "Investor ID", required = true) @PathVariable Long id,
      @Parameter(description = "Updated investor information", required = true) @Valid @RequestBody
          InvestorDto investorDto) {

    log.info("Updating investor with ID: {}", id);
    InvestorDto updatedInvestor = investorService.updateInvestor(id, investorDto);
    return ResponseEntity.ok(updatedInvestor);
  }

  /** Delete investor by ID */
  @DeleteMapping("/{id}")
  @Operation(summary = "Delete investor", description = "Deletes an investor by ID")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "204", description = "Investor deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Investor not found")
      })
  public ResponseEntity<Void> deleteInvestor(
      @Parameter(description = "Investor ID", required = true) @PathVariable Long id) {

    log.info("Deleting investor with ID: {}", id);
    investorService.deleteInvestor(id);
    return ResponseEntity.noContent().build();
  }
}
