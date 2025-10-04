package com.nested.app.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nested.app.dto.ChildDTO;
import com.nested.app.services.ChildService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * REST Controller for managing Child entities
 * Provides endpoints for CRUD operations on children
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

    /**
     * Retrieves all children
     * 
     * @return ResponseEntity containing list of all children
     */
    @GetMapping
    @Operation(
        summary = "Get all children",
        description = "Retrieves a list of all children in the system"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Successfully retrieved children",
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
    public ResponseEntity<Map<String, List<ChildDTO>>> getAllChildren() {
        log.info("GET /api/v1/children - Retrieving all children");
        
        try {
            List<ChildDTO> children = childService.getAllChildren();
            log.info("Successfully retrieved {} children", children.size());
            
            return ResponseEntity.ok(Map.of("data", children));
            
        } catch (Exception e) {
            log.error("Error retrieving children: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Creates a new child
     * 
     * @param requestBody Request body containing child data
     * @return ResponseEntity containing the created child
     */
    @PostMapping
    @Operation(
        summary = "Create a new child",
        description = "Creates a new child with the provided information"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "201",
            description = "Child created successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Map.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input data"
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error"
        )
    })
    public ResponseEntity<Map<String, List<ChildDTO>>> createChild(
            @RequestBody Map<String, List<ChildDTO>> requestBody) {
        
        log.info("POST /api/v1/children - Creating new child");
        
        try {
            List<ChildDTO> childData = requestBody.get("data");
            if (childData == null || childData.isEmpty()) {
                log.warn("Invalid request body: missing or empty data array");
                return ResponseEntity.badRequest().build();
            }
            
            List<ChildDTO> createdChildren = childService.createChildren(childData);
            log.info("Successfully created {} children", createdChildren.size());
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("data", createdChildren));
                    
        } catch (Exception e) {
            log.error("Error creating child: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Updates an existing child
     * 
     * @param requestBody Request body containing updated child data
     * @return ResponseEntity containing the updated child
     */
    @PutMapping
    @Operation(
        summary = "Update an existing child",
        description = "Updates an existing child with the provided information"
    )
    @ApiResponses(value = {
        @ApiResponse(
            responseCode = "200",
            description = "Child updated successfully",
            content = @Content(
                mediaType = "application/json",
                schema = @Schema(implementation = Map.class)
            )
        ),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input data"
        ),
        @ApiResponse(
            responseCode = "404",
            description = "Child not found"
        ),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error"
        )
    })
    public ResponseEntity<Map<String, List<ChildDTO>>> updateChild(
            @RequestBody Map<String, List<ChildDTO>> requestBody) {
        
        log.info("PUT /api/v1/children - Updating child");
        
        try {
            List<ChildDTO> childData = requestBody.get("data");
            if (childData == null || childData.isEmpty()) {
                log.warn("Invalid request body: missing or empty data array");
                return ResponseEntity.badRequest().build();
            }
            
            List<ChildDTO> updatedChildren = childService.updateChildren(childData);
            log.info("Successfully updated {} children", updatedChildren.size());
            
            return ResponseEntity.ok(Map.of("data", updatedChildren));
            
        } catch (Exception e) {
            log.error("Error updating child: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
