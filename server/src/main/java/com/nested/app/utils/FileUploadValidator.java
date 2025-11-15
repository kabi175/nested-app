package com.nested.app.utils;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;

/**
 * Utility class for validating file uploads
 * Prevents malicious file uploads and ensures file type safety
 */
@Component
@Slf4j
public class FileUploadValidator {

    // Allowed MIME types
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp"
    );

    private static final List<String> ALLOWED_DOCUMENT_TYPES = Arrays.asList(
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png"
    );

    // Maximum file size: 10MB (in bytes)
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    // Allowed file extensions
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
        ".jpg", ".jpeg", ".png", ".gif", ".webp", ".pdf"
    );

    /**
     * Validates a file upload for documents
     * 
     * @param file The file to validate
     * @return Validation result with error message if invalid
     */
    public ValidationResult validateDocument(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ValidationResult.invalid("File is required and cannot be empty");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            return ValidationResult.invalid(
                String.format("File size exceeds maximum allowed size of %d MB", MAX_FILE_SIZE / (1024 * 1024))
            );
        }

        // Check filename
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            return ValidationResult.invalid("File name is required");
        }

        // Sanitize filename - check for path traversal
        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            return ValidationResult.invalid("Invalid file name: path traversal detected");
        }

        // Check file extension
        String extension = getFileExtension(originalFilename);
        if (extension == null || !ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            return ValidationResult.invalid(
                String.format("File type not allowed. Allowed types: %s", String.join(", ", ALLOWED_EXTENSIONS))
            );
        }

        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_DOCUMENT_TYPES.contains(contentType.toLowerCase())) {
            return ValidationResult.invalid(
                String.format("Content type not allowed. Allowed types: %s", String.join(", ", ALLOWED_DOCUMENT_TYPES))
            );
        }

        // Verify content type matches extension
        if (!isContentTypeMatchingExtension(contentType, extension)) {
            log.warn("Content type {} does not match extension {} for file {}", contentType, extension, originalFilename);
            // This is a warning, not a hard failure, but we should log it
        }

        return ValidationResult.valid();
    }

    /**
     * Validates a file upload for images
     * 
     * @param file The file to validate
     * @return Validation result with error message if invalid
     */
    public ValidationResult validateImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ValidationResult.invalid("File is required and cannot be empty");
        }

        // Check file size
        if (file.getSize() > MAX_FILE_SIZE) {
            return ValidationResult.invalid(
                String.format("File size exceeds maximum allowed size of %d MB", MAX_FILE_SIZE / (1024 * 1024))
            );
        }

        // Check filename
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            return ValidationResult.invalid("File name is required");
        }

        // Sanitize filename
        if (originalFilename.contains("..") || originalFilename.contains("/") || originalFilename.contains("\\")) {
            return ValidationResult.invalid("Invalid file name: path traversal detected");
        }

        // Check content type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            return ValidationResult.invalid(
                String.format("Content type not allowed. Allowed image types: %s", String.join(", ", ALLOWED_IMAGE_TYPES))
            );
        }

        return ValidationResult.valid();
    }

    /**
     * Gets file extension from filename
     */
    private String getFileExtension(String filename) {
        if (filename == null || filename.isEmpty()) {
            return null;
        }
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex == -1 || lastDotIndex == filename.length() - 1) {
            return null;
        }
        return filename.substring(lastDotIndex).toLowerCase();
    }

    /**
     * Checks if content type matches file extension
     */
    private boolean isContentTypeMatchingExtension(String contentType, String extension) {
        if (contentType == null || extension == null) {
            return false;
        }

        String lowerContentType = contentType.toLowerCase();
        String lowerExtension = extension.toLowerCase();

        if (lowerExtension.equals(".jpg") || lowerExtension.equals(".jpeg")) {
            return lowerContentType.equals("image/jpeg") || lowerContentType.equals("image/jpg");
        }
        if (lowerExtension.equals(".png")) {
            return lowerContentType.equals("image/png");
        }
        if (lowerExtension.equals(".gif")) {
            return lowerContentType.equals("image/gif");
        }
        if (lowerExtension.equals(".webp")) {
            return lowerContentType.equals("image/webp");
        }
        if (lowerExtension.equals(".pdf")) {
            return lowerContentType.equals("application/pdf");
        }

        return false;
    }

    /**
     * Validation result class
     */
    public static class ValidationResult {
        private final boolean valid;
        private final String errorMessage;

        private ValidationResult(boolean valid, String errorMessage) {
            this.valid = valid;
            this.errorMessage = errorMessage;
        }

        public static ValidationResult valid() {
            return new ValidationResult(true, null);
        }

        public static ValidationResult invalid(String errorMessage) {
            return new ValidationResult(false, errorMessage);
        }

        public boolean isValid() {
            return valid;
        }

        public String getErrorMessage() {
            return errorMessage;
        }
    }
}

