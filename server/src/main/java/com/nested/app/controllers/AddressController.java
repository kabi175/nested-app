package com.nested.app.controllers;

import com.nested.app.dto.AddressDto;
import com.nested.app.dto.Entity;
import com.nested.app.services.AddressService;
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
 * REST Controller for Address management operations
 * Provides comprehensive CRUD operations for address entities
 */
@Slf4j
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/addresses")
@Tag(name = "Address Management", description = "APIs for managing addresses")
public class AddressController {

    private final AddressService addressService;

    /**
     * Create a new address for an investor
     */
    @PostMapping(value = "/investor/{investorId}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Create address for investor", description = "Creates a new address for the specified investor")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Address created successfully",
                    content = @Content(schema = @Schema(implementation = AddressDto.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Investor not found")
    })
    public ResponseEntity<AddressDto> createAddress(
            @Parameter(description = "Investor ID", required = true)
            @PathVariable Long investorId,
            @Parameter(description = "Address information", required = true)
            @Valid @RequestBody AddressDto addressDto) {
        
        log.info("Creating new address for investor ID: {}", investorId);
        AddressDto createdAddress = addressService.createAddress(investorId, addressDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAddress);
    }

    /**
     * Get address by ID
     */
    @GetMapping(value = "/{id}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get address by ID", description = "Retrieves address information by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Address found",
                    content = @Content(schema = @Schema(implementation = AddressDto.class))),
        @ApiResponse(responseCode = "404", description = "Address not found")
    })
    public ResponseEntity<AddressDto> getAddressById(
            @Parameter(description = "Address ID", required = true)
            @PathVariable Long id) {
        
        log.debug("Fetching address with ID: {}", id);
        AddressDto address = addressService.getAddressById(id);
        return ResponseEntity.ok(address);
    }

    /**
     * Update address by ID
     */
    @PutMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Update address", description = "Updates address information by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Address updated successfully",
                    content = @Content(schema = @Schema(implementation = AddressDto.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Address not found")
    })
    public ResponseEntity<AddressDto> updateAddress(
            @Parameter(description = "Address ID", required = true)
            @PathVariable Long id,
            @Parameter(description = "Updated address information", required = true)
            @Valid @RequestBody AddressDto addressDto) {
        
        log.info("Updating address with ID: {}", id);
        AddressDto updatedAddress = addressService.updateAddress(id, addressDto);
        return ResponseEntity.ok(updatedAddress);
    }

    /**
     * Delete address by ID
     */
    @DeleteMapping("/{id}")
    @Operation(summary = "Delete address", description = "Deletes an address by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Address deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Address not found")
    })
    public ResponseEntity<Void> deleteAddress(
            @Parameter(description = "Address ID", required = true)
            @PathVariable Long id) {
        
        log.info("Deleting address with ID: {}", id);
        addressService.deleteAddress(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get all addresses for a specific investor
     */
    @GetMapping(value = "/investor/{investorId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get addresses by investor", description = "Retrieves all addresses for a specific investor")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Addresses retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Entity.class))),
        @ApiResponse(responseCode = "204", description = "No addresses found for investor")
    })
    public ResponseEntity<Entity<AddressDto>> getAddressesByInvestorId(
            @Parameter(description = "Investor ID", required = true)
            @PathVariable Long investorId) {
        
        log.debug("Fetching addresses for investor ID: {}", investorId);
        List<AddressDto> addresses = addressService.getAddressesByInvestorId(investorId);
        
        if (addresses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(Entity.of(addresses));
    }

    /**
     * Get addresses for a specific investor with pagination
     */
    @GetMapping(value = "/investor/{investorId}/paginated", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get addresses by investor (paginated)", description = "Retrieves addresses for a specific investor with pagination")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Addresses retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Entity.class))),
        @ApiResponse(responseCode = "204", description = "No addresses found for investor")
    })
    public ResponseEntity<Entity<AddressDto>> getAddressesByInvestorIdPaginated(
            @Parameter(description = "Investor ID", required = true)
            @PathVariable Long investorId,
            @Parameter(description = "Pagination information")
            @PageableDefault(sort = "id", size = 20) Pageable pageable) {
        
        log.debug("Fetching addresses for investor ID: {} with pagination", investorId);
        Page<AddressDto> addresses = addressService.getAddressesByInvestorId(investorId, pageable);
        
        if (addresses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(Entity.of(addresses.getContent()));
    }

    /**
     * Get all addresses with pagination
     */
    @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get all addresses", description = "Retrieves all addresses with pagination support")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Addresses retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Entity.class))),
        @ApiResponse(responseCode = "204", description = "No addresses found")
    })
    public ResponseEntity<Entity<AddressDto>> getAllAddresses(
            @Parameter(description = "Pagination information")
            @PageableDefault(sort = "id", size = 20) Pageable pageable) {
        
        log.debug("Fetching all addresses with pagination: page {}, size {}", 
                 pageable.getPageNumber(), pageable.getPageSize());
        
        Page<AddressDto> addresses = addressService.getAllAddresses(pageable);
        
        if (addresses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(Entity.of(addresses.getContent()));
    }

    /**
     * Search addresses by criteria
     */
    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Search addresses", description = "Search addresses by various criteria")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Search results retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Entity.class))),
        @ApiResponse(responseCode = "204", description = "No addresses found matching criteria")
    })
    public ResponseEntity<Entity<AddressDto>> searchAddresses(
            @Parameter(description = "Investor ID to filter by")
            @RequestParam(required = false) Long investorId,
            @Parameter(description = "City to search (partial match)")
            @RequestParam(required = false) String city,
            @Parameter(description = "State to search (partial match)")
            @RequestParam(required = false) String state,
            @Parameter(description = "Country to search (partial match)")
            @RequestParam(required = false) String country,
            @Parameter(description = "Pagination information")
            @PageableDefault(sort = "id", size = 20) Pageable pageable) {
        
        log.debug("Searching addresses with criteria - investorId: {}, city: {}, state: {}, country: {}", 
                 investorId, city, state, country);
        
        Page<AddressDto> addresses = addressService.searchAddresses(investorId, city, state, country, pageable);
        
        if (addresses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(Entity.of(addresses.getContent()));
    }

    /**
     * Get addresses by city
     */
    @GetMapping(value = "/city/{city}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get addresses by city", description = "Retrieves addresses filtered by city")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Addresses retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Entity.class))),
        @ApiResponse(responseCode = "204", description = "No addresses found in specified city")
    })
    public ResponseEntity<Entity<AddressDto>> getAddressesByCity(
            @Parameter(description = "City name", required = true)
            @PathVariable String city,
            @Parameter(description = "Pagination information")
            @PageableDefault(sort = "id", size = 20) Pageable pageable) {
        
        log.debug("Fetching addresses by city: {}", city);
        Page<AddressDto> addresses = addressService.getAddressesByCity(city, pageable);
        
        if (addresses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(Entity.of(addresses.getContent()));
    }

    /**
     * Get addresses by state
     */
    @GetMapping(value = "/state/{state}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get addresses by state", description = "Retrieves addresses filtered by state")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Addresses retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Entity.class))),
        @ApiResponse(responseCode = "204", description = "No addresses found in specified state")
    })
    public ResponseEntity<Entity<AddressDto>> getAddressesByState(
            @Parameter(description = "State name", required = true)
            @PathVariable String state,
            @Parameter(description = "Pagination information")
            @PageableDefault(sort = "id", size = 20) Pageable pageable) {
        
        log.debug("Fetching addresses by state: {}", state);
        Page<AddressDto> addresses = addressService.getAddressesByState(state, pageable);
        
        if (addresses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(Entity.of(addresses.getContent()));
    }

    /**
     * Get addresses by country
     */
    @GetMapping(value = "/country/{country}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get addresses by country", description = "Retrieves addresses filtered by country")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Addresses retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Entity.class))),
        @ApiResponse(responseCode = "204", description = "No addresses found in specified country")
    })
    public ResponseEntity<Entity<AddressDto>> getAddressesByCountry(
            @Parameter(description = "Country name", required = true)
            @PathVariable String country,
            @Parameter(description = "Pagination information")
            @PageableDefault(sort = "id", size = 20) Pageable pageable) {
        
        log.debug("Fetching addresses by country: {}", country);
        Page<AddressDto> addresses = addressService.getAddressesByCountry(country, pageable);
        
        if (addresses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(Entity.of(addresses.getContent()));
    }

    /**
     * Get addresses by pin code
     */
    @GetMapping(value = "/pin-code/{pinCode}", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Get addresses by pin code", description = "Retrieves addresses filtered by pin code")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Addresses retrieved successfully",
                    content = @Content(schema = @Schema(implementation = Entity.class))),
        @ApiResponse(responseCode = "204", description = "No addresses found with specified pin code")
    })
    public ResponseEntity<Entity<AddressDto>> getAddressesByPinCode(
            @Parameter(description = "Pin code", required = true)
            @PathVariable String pinCode) {
        
        log.debug("Fetching addresses by pin code: {}", pinCode);
        List<AddressDto> addresses = addressService.getAddressesByPinCode(pinCode);
        
        if (addresses.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        
        return ResponseEntity.ok(Entity.of(addresses));
    }

    /**
     * Delete all addresses for a specific investor
     */
    @DeleteMapping("/investor/{investorId}")
    @Operation(summary = "Delete all addresses for investor", description = "Deletes all addresses for a specific investor")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "All addresses deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Investor not found")
    })
    public ResponseEntity<Void> deleteAddressesByInvestorId(
            @Parameter(description = "Investor ID", required = true)
            @PathVariable Long investorId) {
        
        log.info("Deleting all addresses for investor ID: {}", investorId);
        addressService.deleteAddressesByInvestorId(investorId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Check if address exists
     */
    @GetMapping(value = "/{id}/exists", produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Check address existence", description = "Checks if an address exists by ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Existence check completed")
    })
    public ResponseEntity<Boolean> checkAddressExists(
            @Parameter(description = "Address ID", required = true)
            @PathVariable Long id) {
        
        log.debug("Checking existence of address with ID: {}", id);
        boolean exists = addressService.existsById(id);
        return ResponseEntity.ok(exists);
    }
}
