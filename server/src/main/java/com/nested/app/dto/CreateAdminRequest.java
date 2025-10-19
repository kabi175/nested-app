package com.nested.app.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

/**
 * Request DTO for creating admin users
 * Either email or firebaseUid must be provided
 */
@Data
public class CreateAdminRequest {
    
    @Email(message = "Invalid email format")
    private String email;
    
    private String firebaseUid;
    
    private String firstName;
    
    private String lastName;
    
    /**
     * Validates that at least email or firebaseUid is provided
     */
    public boolean isValid() {
        return (email != null && !email.isEmpty()) || 
               (firebaseUid != null && !firebaseUid.isEmpty());
    }
}

