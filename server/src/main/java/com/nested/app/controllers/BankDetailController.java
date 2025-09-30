package com.nested.app.controllers;

import com.nested.app.dto.BankDetailDto;
import com.nested.app.dto.Entity;
import com.nested.app.entity.BankDetail;
import com.nested.app.services.BankDetailService;
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

import java.util.List;

/**
 * REST Controller for BankDetail management operations
 * Provides comprehensive CRUD operations for bank detail entities
 */
@Slf4j
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/bank-details")
@Tag(name = "Bank Detail Management", description = "APIs for managing bank details")
public class BankDetailController {

    private final BankDetailService bankDetailService;

    /**
     * Create a new bank detail for an investor
     */
    @PostMapping(value = "/investor/{investorId}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create bank detail for investor", description = "Creates a new bank detail for the specified investor")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Bank detail created successfully",
                    content = @Content(schema = @Schema(implementation = BankDetailDto.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Investor not found"),
        @ApiResponse(responseCode = "409", description = "Account number already exists")
    })
    public ResponseEntity<BankDetailDto> createBankDetail(
            @Parameter(description = "Investor ID", required = true)
            @PathVariable Long investorId,
            @Parameter(description = "Bank detail information", required = true)
            @Valid @RequestBody BankDetailDto bankDetailDto) {
        
        log.info("Creating new bank detail for investor ID: {}", investorId);
        BankDetailDto createdBankDetail = bankDetailService.createBankDetail(investorId, bankDetailDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBankDetail);
    }

    /**
     * Get bank detail by ID
     */
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get bank detail by ID", description = "Retrieves bank detail information by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bank detail found",
                    content = @Content(schema = @Schema(implementation = BankDetailDto.class))),
        @ApiResponse(responseCode = "404", description = "Bank detail not found")
    })
    public ResponseEntity<BankDetailDto> getBankDetailById(
            @Parameter(description = "Bank detail ID", required = true)
            @PathVariable Long id) {
        
        log.debug("Fetching bank detail with ID: {}", id);
        BankDetailDto bankDetail = bankDetailService.getBankDetailById(id);
        return ResponseEntity.ok(bankDetail);
    }

    /**
     * Update bank detail by ID
     */
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Update bank detail", description = "Updates bank detail information by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bank detail updated successfully",
                    content = @Content(schema = @Schema(implementation = BankDetailDto.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Bank detail not found"),
        @ApiResponse(responseCode = "409", description = "Account number already exists")
    })
    public ResponseEntity<BankDetailDto> updateBankDetail(
            @Parameter(description = "Bank detail ID", required = true)
            @PathVariable Long id,
            @Parameter(description = "Updated bank detail information", required = true)
            @Valid @RequestBody BankDetailDto bankDetailDto) {
        
        log.info("Updating bank detail with ID: {}", id);
        BankDetailDto updatedBankDetail = bankDetailService.updateBankDetail(id, bankDetailDto);
        return ResponseEntity.ok(updatedBankDetail);
    }

    /**
     * Set bank detail as primary
     */
    @PatchMapping(value = "/{id}/set-primary", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Set bank detail as primary", description = "Sets a bank detail as the primary account for the investor")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bank detail set as primary successfully",
                    content = @Content(schema = @Schema(implementation = BankDetailDto.class))),
        @ApiResponse(responseCode = "404", description = "Bank detail not found")
    })
    public ResponseEntity<BankDetailDto> setAsPrimary(
            @Parameter(description = "Bank detail ID", required = true)
            @PathVariable Long id) {
        
        log.info("Setting bank detail ID: {} as primary", id);
        BankDetailDto updatedBankDetail = bankDetailService.setAsPrimary(id);
        return ResponseEntity.ok(updatedBankDetail);
    }

    /**
     * Delete bank detail by ID
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete bank detail", description = "Deletes a bank detail by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Bank detail deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Bank detail not found")
    })
    public ResponseEntity<Void> deleteBankDetail(
            @Parameter(description = "Bank detail ID", required = true)
            @PathVariable Long id) {
        
        log.info("Deleting bank detail with ID: {}", id);
        bankDetailService.deleteBankDetail(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all bank details for a specific investor
     */
    @GetMapping(value = "/investor/{investorId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get bank details by investor", description = "Retrieves all bank details for a specific investor")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bank details retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Entity.class))),
        @ApiResponse(responseCode = "204", description = "No bank details found for investor")
    })
    public ResponseEntity<Entity<BankDetailDto>> getBankDetailsByInvestorId(
            @Parameter(description = "Investor ID", required = true)
            @PathVariable Long investorId) {
        
        log.debug("Fetching bank details for investor ID: {}", investorId);
        List<BankDetailDto> bankDetails = bankDetailService.getBankDetailsByInvestorId(investorId);
        
        if (bankDetails.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(Entity.of(bankDetails));
    }

    /**
     * Get bank details for a specific investor with pagination
     */
    @GetMapping(value = "/investor/{investorId}/paginated", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get bank details by investor (paginated)", description = "Retrieves bank details for a specific investor with pagination")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bank details retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Entity.class))),
        @ApiResponse(responseCode = "204", description = "No bank details found for investor")
    })
    public ResponseEntity<Entity<BankDetailDto>> getBankDetailsByInvestorIdPaginated(
            @Parameter(description = "Investor ID", required = true)
            @PathVariable Long investorId,
            @Parameter(description = "Pagination information")
            @PageableDefault(sort = "id", size = 20) Pageable pageable) {
        
        log.debug("Fetching bank details for investor ID: {} with pagination", investorId);
        Page<BankDetailDto> bankDetails = bankDetailService.getBankDetailsByInvestorId(investorId, pageable);
        
        if (bankDetails.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(Entity.of(bankDetails.getContent()));
    }

    /**
     * Get primary bank detail for a specific investor
     */
    @GetMapping(value = "/investor/{investorId}/primary", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get primary bank detail", description = "Retrieves the primary bank detail for a specific investor")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Primary bank detail found",
                    content = @Content(schema = @Schema(implementation = BankDetailDto.class))),
        @ApiResponse(responseCode = "404", description = "No primary bank detail found for investor")
    })
    public ResponseEntity<BankDetailDto> getPrimaryBankDetailByInvestorId(
            @Parameter(description = "Investor ID", required = true)
            @PathVariable Long investorId) {
        
        log.debug("Fetching primary bank detail for investor ID: {}", investorId);
        BankDetailDto bankDetail = bankDetailService.getPrimaryBankDetailByInvestorId(investorId);
        return ResponseEntity.ok(bankDetail);
    }

    /**
     * Get all bank details with pagination
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get all bank details", description = "Retrieves all bank details with pagination support")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bank details retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Entity.class))),
        @ApiResponse(responseCode = "204", description = "No bank details found")
    })
    public ResponseEntity<Entity<BankDetailDto>> getAllBankDetails(
            @Parameter(description = "Pagination information")
            @PageableDefault(sort = "id", size = 20) Pageable pageable) {
        
        log.debug("Fetching all bank details with pagination: page {}, size {}", 
                 pageable.getPageNumber(), pageable.getPageSize());
        
        Page<BankDetailDto> bankDetails = bankDetailService.getAllBankDetails(pageable);
        
        if (bankDetails.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(Entity.of(bankDetails.getContent()));
    }

    /**
     * Search bank details by criteria
     */
    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Search bank details", description = "Search bank details by various criteria")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Search results retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Entity.class))),
        @ApiResponse(responseCode = "204", description = "No bank details found matching criteria")
    })
    public ResponseEntity<Entity<BankDetailDto>> searchBankDetails(
            @Parameter(description = "Investor ID to filter by")
            @RequestParam(required = false) Long investorId,
            @Parameter(description = "Bank name to search (partial match)")
            @RequestParam(required = false) String bankName,
            @Parameter(description = "Account type to filter by")
            @RequestParam(required = false) BankDetail.AccountType accountType,
            @Parameter(description = "Primary flag to filter by")
            @RequestParam(required = false) Boolean isPrimary,
            @Parameter(description = "Pagination information")
            @PageableDefault(sort = "id", size = 20) Pageable pageable) {
        
        log.debug("Searching bank details with criteria - investorId: {}, bankName: {}, accountType: {}, isPrimary: {}", 
                 investorId, bankName, accountType, isPrimary);
        
        Page<BankDetailDto> bankDetails = bankDetailService.searchBankDetails(investorId, bankName, accountType, isPrimary, pageable);
        
        if (bankDetails.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(Entity.of(bankDetails.getContent()));
    }

    /**
     * Get bank details by bank name
     */
    @GetMapping(value = "/bank/{bankName}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get bank details by bank name", description = "Retrieves bank details filtered by bank name")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bank details retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Entity.class))),
        @ApiResponse(responseCode = "204", description = "No bank details found for specified bank")
    })
    public ResponseEntity<Entity<BankDetailDto>> getBankDetailsByBankName(
            @Parameter(description = "Bank name", required = true)
            @PathVariable String bankName,
            @Parameter(description = "Pagination information")
            @PageableDefault(sort = "id", size = 20) Pageable pageable) {
        
        log.debug("Fetching bank details by bank name: {}", bankName);
        Page<BankDetailDto> bankDetails = bankDetailService.getBankDetailsByBankName(bankName, pageable);
        
        if (bankDetails.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(Entity.of(bankDetails.getContent()));
    }

    /**
     * Get bank details by IFSC code
     */
    @GetMapping(value = "/ifsc/{ifscCode}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get bank details by IFSC code", description = "Retrieves bank details filtered by IFSC code")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bank details retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Entity.class))),
        @ApiResponse(responseCode = "204", description = "No bank details found with specified IFSC code")
    })
    public ResponseEntity<Entity<BankDetailDto>> getBankDetailsByIfscCode(
            @Parameter(description = "IFSC code", required = true)
            @PathVariable String ifscCode) {
        
        log.debug("Fetching bank details by IFSC code: {}", ifscCode);
        List<BankDetailDto> bankDetails = bankDetailService.getBankDetailsByIfscCode(ifscCode);
        
        if (bankDetails.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(Entity.of(bankDetails));
    }

    /**
     * Get bank details by account type
     */
    @GetMapping(value = "/account-type/{accountType}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get bank details by account type", description = "Retrieves bank details filtered by account type")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Bank details retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Entity.class))),
        @ApiResponse(responseCode = "204", description = "No bank details found with specified account type")
    })
    public ResponseEntity<Entity<BankDetailDto>> getBankDetailsByAccountType(
            @Parameter(description = "Account type", required = true)
            @PathVariable BankDetail.AccountType accountType,
            @Parameter(description = "Pagination information")
            @PageableDefault(sort = "id", size = 20) Pageable pageable) {
        
        log.debug("Fetching bank details by account type: {}", accountType);
        Page<BankDetailDto> bankDetails = bankDetailService.getBankDetailsByAccountType(accountType, pageable);
        
        if (bankDetails.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(Entity.of(bankDetails.getContent()));
    }

    /**
     * Delete all bank details for a specific investor
     */
    @DeleteMapping("/investor/{investorId}")
    @Operation(summary = "Delete all bank details for investor", description = "Deletes all bank details for a specific investor")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "All bank details deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Investor not found")
    })
    public ResponseEntity<Void> deleteBankDetailsByInvestorId(
            @Parameter(description = "Investor ID", required = true)
            @PathVariable Long investorId) {
        
        log.info("Deleting all bank details for investor ID: {}", investorId);
        bankDetailService.deleteBankDetailsByInvestorId(investorId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Check if bank detail exists
     */
    @GetMapping(value = "/{id}/exists", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Check bank detail existence", description = "Checks if a bank detail exists by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Existence check completed")
    })
    public ResponseEntity<Boolean> checkBankDetailExists(
            @Parameter(description = "Bank detail ID", required = true)
            @PathVariable Long id) {
        
        log.debug("Checking existence of bank detail with ID: {}", id);
        boolean exists = bankDetailService.existsById(id);
        return ResponseEntity.ok(exists);
    }
}
