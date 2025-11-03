package com.nested.app.controllers;

import com.nested.app.dto.BankDetailDto;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

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

}
