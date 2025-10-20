package com.nested.app.validation;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Component;

import com.nested.app.entity.User;

/**
 * Custom validator for User entity
 * Applies different validation rules based on user role
 */
@Component
public class UserValidator {

    /**
     * Validates a user based on their role
     * 
     * @param user The user to validate
     * @throws IllegalArgumentException if validation fails
     */
    public void validate(User user) {
        List<String> errors = new ArrayList<>();

        // Common validations for all users
        if (user.getFirebaseUid() == null || user.getFirebaseUid().isEmpty()) {
            errors.add("Firebase UID is required");
        }

        // Role-specific validations
        if (user.getRole() == User.Role.STANDARD) {
            validateStandardUser(user, errors);
        } else if (user.getRole() == User.Role.ADMIN) {
            validateAdminUser(user, errors);
        }

        if (!errors.isEmpty()) {
            throw new IllegalArgumentException(
                "User validation failed: " + String.join(", ", errors)
            );
        }
    }

    /**
     * Validates required fields for standard users
     */
    private void validateStandardUser(User user, List<String> errors) {
        if (user.getPhoneNumber() == null || user.getPhoneNumber().isEmpty()) {
            errors.add("Phone number is required for standard users");
        }

        if (user.getFirstName() == null || user.getFirstName().isEmpty()) {
            errors.add("First name is required for standard users");
        }

        if (user.getLastName() == null || user.getLastName().isEmpty()) {
            errors.add("Last name is required for standard users");
        }

        // Validate phone number format
        if (user.getPhoneNumber() != null && !isValidPhoneNumber(user.getPhoneNumber())) {
            errors.add("Invalid phone number format");
        }
    }

    /**
     * Validates required fields for admin users
     * Admins have more relaxed requirements
     */
    private void validateAdminUser(User user, List<String> errors) {
        // Email is required for admins (for login)
        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            errors.add("Email is required for admin users");
        }

        // Phone number is optional for admins
        // First/last name are optional for admins
    }

    /**
     * Basic phone number validation
     */
    private boolean isValidPhoneNumber(String phoneNumber) {
        // Simple validation - adjust based on your requirements
        // This allows: +1234567890, 1234567890, +91-1234567890, etc.
        return phoneNumber.matches("^[+]?[0-9\\-\\s()]+$") && 
               phoneNumber.replaceAll("[^0-9]", "").length() >= 10;
    }
}

