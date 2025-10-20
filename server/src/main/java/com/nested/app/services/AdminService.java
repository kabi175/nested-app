package com.nested.app.services;

import com.nested.app.dto.CreateAdminRequest;
import com.nested.app.dto.UserDTO;

/**
 * Service interface for admin user management
 */
public interface AdminService {
    
    /**
     * Creates a new admin user or promotes an existing user to admin
     * 
     * @param request The admin creation request containing email or Firebase UID
     * @return UserDTO of the created/updated admin user
     * @throws IllegalArgumentException if request is invalid
     * @throws RuntimeException if user not found in Firebase
     */
    UserDTO createAdminUser(CreateAdminRequest request);
    
    /**
     * Promotes an existing user to admin role
     * 
     * @param userId The database ID of the user to promote
     * @return UserDTO of the promoted user
     * @throws RuntimeException if user not found
     */
    UserDTO promoteToAdmin(Long userId);
    
    /**
     * Demotes an admin user to standard user role
     * 
     * @param userId The database ID of the user to demote
     * @return UserDTO of the demoted user
     * @throws RuntimeException if user not found
     */
    UserDTO demoteFromAdmin(Long userId);
}

