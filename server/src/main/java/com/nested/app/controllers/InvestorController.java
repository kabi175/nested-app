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
 * REST Controller for Investor management operations
 * Provides comprehensive CRUD operations for investor entities
 */
@Slf4j
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/investors")
@Tag(name = "Investor Management", description = "APIs for managing investors")
public class InvestorController {

    private final InvestorService investorService;

    /**
     * Create a new investor
     */
    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create a new investor", description = "Creates a new investor with the provided information")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Investor created successfully",
                    content = @Content(schema = @Schema(implementation = InvestorDto.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "409", description = "Email, client code, or PAN already exists")
    })
    public ResponseEntity<InvestorDto> createInvestor(
            @Parameter(description = "Investor information", required = true)
            @Valid @RequestBody InvestorDto investorDto) {
        
        log.info("Creating new investor with email: {}", investorDto.getEmail());
        InvestorDto createdInvestor = investorService.createInvestor(investorDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdInvestor);
    }

    /**
     * Get investor by ID
     */
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get investor by ID", description = "Retrieves investor information by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Investor found",
                    content = @Content(schema = @Schema(implementation = InvestorDto.class))),
        @ApiResponse(responseCode = "404", description = "Investor not found")
    })
    public ResponseEntity<InvestorDto> getInvestorById(
            @Parameter(description = "Investor ID", required = true)
            @PathVariable Long id) {
        
        log.debug("Fetching investor with ID: {}", id);
        InvestorDto investor = investorService.getInvestorById(id);
        return ResponseEntity.ok(investor);
    }

    /**
     * Get investor with full details by ID
     */
    @GetMapping(value = "/{id}/details", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get investor with full details", description = "Retrieves investor information with addresses and bank details")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Investor found with details",
                    content = @Content(schema = @Schema(implementation = InvestorDto.class))),
        @ApiResponse(responseCode = "404", description = "Investor not found")
    })
    public ResponseEntity<InvestorDto> getInvestorWithDetails(
            @Parameter(description = "Investor ID", required = true)
            @PathVariable Long id) {
        
        log.debug("Fetching investor with details for ID: {}", id);
        InvestorDto investor = investorService.getInvestorWithDetails(id);
        return ResponseEntity.ok(investor);
    }

    /**
     * Update investor by ID
     */
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Update investor", description = "Updates investor information by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Investor updated successfully",
                    content = @Content(schema = @Schema(implementation = InvestorDto.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Investor not found"),
        @ApiResponse(responseCode = "409", description = "Email, client code, or PAN already exists")
    })
    public ResponseEntity<InvestorDto> updateInvestor(
            @Parameter(description = "Investor ID", required = true)
            @PathVariable Long id,
            @Parameter(description = "Updated investor information", required = true)
            @Valid @RequestBody InvestorDto investorDto) {
        
        log.info("Updating investor with ID: {}", id);
        InvestorDto updatedInvestor = investorService.updateInvestor(id, investorDto);
        return ResponseEntity.ok(updatedInvestor);
    }

    /**
     * Update investor KYC status
     */
    @PatchMapping(value = "/{id}/kyc-status", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Update KYC status", description = "Updates the KYC status of an investor")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "KYC status updated successfully",
                    content = @Content(schema = @Schema(implementation = InvestorDto.class))),
        @ApiResponse(responseCode = "404", description = "Investor not found")
    })
    public ResponseEntity<InvestorDto> updateKycStatus(
            @Parameter(description = "Investor ID", required = true)
            @PathVariable Long id,
            @Parameter(description = "New KYC status", required = true)
            @RequestParam Investor.KYCStatus kycStatus) {
        
        log.info("Updating KYC status for investor ID: {} to {}", id, kycStatus);
        InvestorDto updatedInvestor = investorService.updateKycStatus(id, kycStatus);
        return ResponseEntity.ok(updatedInvestor);
    }

    /**
     * Delete investor by ID
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete investor", description = "Deletes an investor by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Investor deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Investor not found")
    })
    public ResponseEntity<Void> deleteInvestor(
            @Parameter(description = "Investor ID", required = true)
            @PathVariable Long id) {
        
        log.info("Deleting investor with ID: {}", id);
        investorService.deleteInvestor(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all investors with pagination
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get all investors", description = "Retrieves all investors with pagination support")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Investors retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Entity.class))),
        @ApiResponse(responseCode = "204", description = "No investors found")
    })
    public ResponseEntity<Entity<InvestorDto>> getAllInvestors(
            @Parameter(description = "Pagination information")
            @PageableDefault(sort = "id", size = 20) Pageable pageable) {
        
        log.debug("Fetching all investors with pagination: page {}, size {}", 
                 pageable.getPageNumber(), pageable.getPageSize());
        
        Page<InvestorDto> investors = investorService.getAllInvestors(pageable);
        
        if (investors.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(Entity.of(investors.getContent()));
    }

    /**
     * Search investors by criteria
     */
    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Search investors", description = "Search investors by various criteria")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Search results retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Entity.class))),
        @ApiResponse(responseCode = "204", description = "No investors found matching criteria")
    })
    public ResponseEntity<Entity<InvestorDto>> searchInvestors(
            @Parameter(description = "First name to search (partial match)")
            @RequestParam(required = false) String firstName,
            @Parameter(description = "Email to search (partial match)")
            @RequestParam(required = false) String email,
            @Parameter(description = "KYC status to filter by")
            @RequestParam(required = false) Investor.KYCStatus kycStatus,
            @Parameter(description = "Pagination information")
            @PageableDefault(sort = "id", size = 20) Pageable pageable) {
        
        log.debug("Searching investors with criteria - firstName: {}, email: {}, kycStatus: {}", 
                 firstName, email, kycStatus);
        
        Page<InvestorDto> investors = investorService.searchInvestors(firstName, email, kycStatus, pageable);
        
        if (investors.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(Entity.of(investors.getContent()));
    }

    /**
     * Get investors by KYC status
     */
    @GetMapping(value = "/kyc-status/{kycStatus}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get investors by KYC status", description = "Retrieves investors filtered by KYC status")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Investors retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Entity.class))),
        @ApiResponse(responseCode = "204", description = "No investors found with specified KYC status")
    })
    public ResponseEntity<Entity<InvestorDto>> getInvestorsByKycStatus(
            @Parameter(description = "KYC status to filter by", required = true)
            @PathVariable Investor.KYCStatus kycStatus,
            @Parameter(description = "Pagination information")
            @PageableDefault(sort = "id", size = 20) Pageable pageable) {
        
        log.debug("Fetching investors with KYC status: {}", kycStatus);
        
        Page<InvestorDto> investors = investorService.getInvestorsByKycStatus(kycStatus, pageable);
        
        if (investors.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(Entity.of(investors.getContent()));
    }

    /**
     * Get investor by email
     */
    @GetMapping(value = "/email/{email}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get investor by email", description = "Retrieves investor information by email address")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Investor found",
                    content = @Content(schema = @Schema(implementation = InvestorDto.class))),
        @ApiResponse(responseCode = "404", description = "Investor not found")
    })
    public ResponseEntity<InvestorDto> getInvestorByEmail(
            @Parameter(description = "Email address", required = true)
            @PathVariable String email) {
        
        log.debug("Fetching investor with email: {}", email);
        InvestorDto investor = investorService.getInvestorByEmail(email);
        return ResponseEntity.ok(investor);
    }

    /**
     * Get investor by client code
     */
    @GetMapping(value = "/client-code/{clientCode}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get investor by client code", description = "Retrieves investor information by client code")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Investor found",
                    content = @Content(schema = @Schema(implementation = InvestorDto.class))),
        @ApiResponse(responseCode = "404", description = "Investor not found")
    })
    public ResponseEntity<InvestorDto> getInvestorByClientCode(
            @Parameter(description = "Client code", required = true)
            @PathVariable String clientCode) {
        
        log.debug("Fetching investor with client code: {}", clientCode);
        InvestorDto investor = investorService.getInvestorByClientCode(clientCode);
        return ResponseEntity.ok(investor);
    }

    /**
     * Check if investor exists
     */
    @GetMapping(value = "/{id}/exists", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Check investor existence", description = "Checks if an investor exists by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Existence check completed")
    })
    public ResponseEntity<Boolean> checkInvestorExists(
            @Parameter(description = "Investor ID", required = true)
            @PathVariable Long id) {
        
        log.debug("Checking existence of investor with ID: {}", id);
        boolean exists = investorService.existsById(id);
        return ResponseEntity.ok(exists);
    }
}
