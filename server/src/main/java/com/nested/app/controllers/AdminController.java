package com.nested.app.controllers;

import com.nested.app.annotation.AdminOnly;
import com.nested.app.dto.CreateAdminRequest;
import com.nested.app.dto.UserDTO;
import com.nested.app.services.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.HashMap;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Validated
@RequiredArgsConstructor
@RequestMapping("/api/v1/admin")
@Tag(name = "Admin Management", description = "APIs for managing admin users")
public class AdminController {

    private final AdminService adminService;

    @PostMapping(path = "/create-admin", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    @AdminOnly
    @Operation(
        summary = "Create admin user (Admin only)",
        description = "Creates a new admin user with Firebase custom claims. Can create by email or existing Firebase UID."
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Admin user created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or user already exists"),
        @ApiResponse(responseCode = "403", description = "Access denied - Admin role required"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<?> createAdminUser(
            @Parameter(description = "Admin user details", required = true)
            @Validated @RequestBody CreateAdminRequest request) {

        log.info("POST /api/v1/admin/create-admin - Creating admin user");

        try {
            UserDTO createdAdmin = adminService.createAdminUser(request);
            
            return ResponseEntity.ok(createSuccessResponse(
                "Admin user created successfully",
                createdAdmin
            ));
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid request for admin creation: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(createErrorResponse(e.getMessage()));
                
        } catch (RuntimeException e) {
            log.error("Error creating admin user: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(createErrorResponse(e.getMessage()));
                
        } catch (Exception e) {
            log.error("Unexpected error creating admin user", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Failed to create admin user: " + e.getMessage()));
        }
    }

    @PostMapping(path = "/promote/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @AdminOnly
    @Operation(
        summary = "Promote user to admin (Admin only)",
        description = "Promotes an existing user to admin role"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "User promoted successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or user already admin"),
        @ApiResponse(responseCode = "403", description = "Access denied - Admin role required"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<?> promoteToAdmin(
            @Parameter(description = "User ID to promote", required = true)
            @PathVariable Long userId) {

        log.info("POST /api/v1/admin/promote/{} - Promoting user to admin", userId);

        try {
            UserDTO promotedUser = adminService.promoteToAdmin(userId);
            
            return ResponseEntity.ok(createSuccessResponse(
                "User promoted to admin successfully",
                promotedUser
            ));
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid promotion request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(createErrorResponse(e.getMessage()));
                
        } catch (RuntimeException e) {
            log.error("Error promoting user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(createErrorResponse(e.getMessage()));
        }
    }

    @PostMapping(path = "/demote/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    @AdminOnly
    @Operation(
        summary = "Demote admin to standard user (Admin only)",
        description = "Demotes an admin user to standard user role"
    )
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Admin demoted successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request or user not admin"),
        @ApiResponse(responseCode = "403", description = "Access denied - Admin role required"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<?> demoteFromAdmin(
            @Parameter(description = "User ID to demote", required = true)
            @PathVariable Long userId) {

        log.info("POST /api/v1/admin/demote/{} - Demoting admin to standard user", userId);

        try {
            UserDTO demotedUser = adminService.demoteFromAdmin(userId);
            
            return ResponseEntity.ok(createSuccessResponse(
                "User demoted to standard user successfully",
                demotedUser
            ));
            
        } catch (IllegalArgumentException e) {
            log.warn("Invalid demotion request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(createErrorResponse(e.getMessage()));
                
        } catch (RuntimeException e) {
            log.error("Error demoting user: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(createErrorResponse(e.getMessage()));
        }
    }

    /**
     * Creates a success response with user data
     */
    private Map<String, Object> createSuccessResponse(String message, UserDTO user) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message);
        response.put("user", user);
        return response;
    }

    /**
     * Creates an error response
     */
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("error", message);
        return response;
    }
}

