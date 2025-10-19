package com.nested.app.validation;

import jakarta.validation.groups.Default;

/**
 * Validation groups for different user types
 * Used to apply different validation rules based on context
 */
public class ValidationGroups {

    /**
     * Validation group for regular/standard users
     * Requires: phone number, first name, last name, etc.
     */
    public interface StandardUser extends Default {
    }

    /**
     * Validation group for admin users
     * More relaxed validation - only essential fields required
     */
    public interface AdminUser extends Default {
    }

    /**
     * Validation group for user updates
     */
    public interface Update {
    }
}

