package com.nested.app.utils;

import com.nested.app.contect.UserContext;
import com.nested.app.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Utility class for authorization checks
 * Ensures users can only access their own data unless they are admins
 */
@Component
@Slf4j
public class AuthorizationUtils {

    /**
     * Checks if the current user is authorized to access/modify data for the given user ID
     * 
     * @param userContext The current user context
     * @param targetUserId The user ID being accessed/modified
     * @return true if authorized, false otherwise
     */
    public boolean isAuthorized(UserContext userContext, Long targetUserId) {
        if (userContext == null || userContext.getUser() == null) {
            log.warn("Authorization check failed: No authenticated user");
            return false;
        }

        User currentUser = userContext.getUser();
        
        // Admins can access any user's data
        if (User.Role.ADMIN.equals(currentUser.getRole())) {
            return true;
        }

        // Users can only access their own data
        return currentUser.getId().equals(targetUserId);
    }

    /**
     * Checks if the current user is authorized to access/modify data for the given user ID (String)
     * 
     * @param userContext The current user context
     * @param targetUserId The user ID being accessed/modified (as String)
     * @return true if authorized, false otherwise
     */
    public boolean isAuthorized(UserContext userContext, String targetUserId) {
        if (userContext == null || userContext.getUser() == null) {
            log.warn("Authorization check failed: No authenticated user");
            return false;
        }

        if (targetUserId == null || targetUserId.trim().isEmpty()) {
            return false;
        }

        try {
            Long targetId = Long.parseLong(targetUserId);
            return isAuthorized(userContext, targetId);
        } catch (NumberFormatException e) {
            log.warn("Invalid user ID format: {}", targetUserId);
            return false;
        }
    }

    /**
     * Checks if the current user is an admin
     * 
     * @param userContext The current user context
     * @return true if user is admin, false otherwise
     */
    public boolean isAdmin(UserContext userContext) {
        if (userContext == null || userContext.getUser() == null) {
            return false;
        }
        return User.Role.ADMIN.equals(userContext.getUser().getRole());
    }
}

