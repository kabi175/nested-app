package com.nested.app.controllers;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nested.app.dto.BasketDTO;
import com.nested.app.services.BasketService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST Controller for managing Basket entities
 * Provides endpoints for retrieving basket details
 * 
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@RestController
@RequestMapping("/api/v1/bucket")
@RequiredArgsConstructor
@Tag(name = "Baskets", description = "API endpoints for managing investment baskets")
public class BasketController {

    private final BasketService basketService;

    /**
     * Retrieves basket details by ID
     * 
     * @param id The ID of the basket
     * @return ResponseEntity containing basket details
     */
    @GetMapping("/{id}")
    @Operation(
        summary = "Get basket details by ID",
        description = "Retrieves detailed information about a specific investment basket"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved basket details",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Map.class)
            )
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Basket not found",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Map.class)
            )
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error"
        )
    })
    public ResponseEntity<?> getBasketById(
            @Parameter(description = "Basket ID", required = true)
            @PathVariable String id) {
        
        log.info("GET /api/v1/bucket/{} - Retrieving basket details", id);
        
        try {
            BasketDTO basket = basketService.getBasketById(id);
            if (basket == null) {
                log.warn("Basket not found with ID: {}", id);
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.<String, Object>of("error", "Basket not found"));
            }
            
            log.info("Successfully retrieved basket details for ID: {}", id);
            return ResponseEntity.ok(Map.<String, Object>of("data", basket));
            
        } catch (Exception e) {
            log.error("Error retrieving basket with ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
