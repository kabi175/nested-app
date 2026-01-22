package com.nested.app.controllers;

import com.nested.app.dto.DocumentDto;
import com.nested.app.dto.UploadResponse;
import com.nested.app.enums.DocumentVisibility;
import com.nested.app.services.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.net.URI;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
@Slf4j
@Validated
@Tag(name = "Document Management", description = "APIs for managing documents with S3 storage")
public class DocumentController {

    private final DocumentService documentService;
  private final com.nested.app.context.UserContext userContext;
    private final com.nested.app.utils.AuthorizationUtils authorizationUtils;

    @Operation(summary = "Upload a document", description = "Upload a document to S3 and store metadata in database")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Document uploaded successfully",
                    content = @Content(schema = @Schema(implementation = UploadResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid input parameters",
                    content = @Content(schema = @Schema(implementation = UploadResponse.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                    content = @Content(schema = @Schema(implementation = UploadResponse.class)))
    })
    @PostMapping("/upload/{userId}")
    public ResponseEntity<UploadResponse> uploadDocument(
            @Parameter(description = "User ID who owns the document", required = true)
            @PathVariable("userId") String userId,
            @Parameter(description = "File to upload", required = true)
            @RequestParam("file") MultipartFile file,
            @Parameter(description = "Document visibility (PUBLIC or PRIVATE)", required = true)
            @RequestParam("visibility") String visibilityStr) {

        log.info("Received upload request for user={} file={} visibility={}",
                userId,
                file == null ? "null" : file.getOriginalFilename(),
                visibilityStr);

        if (!StringUtils.hasText(userId)) {
            return ResponseEntity.badRequest().body(UploadResponse.failure("userId is required"));
        }

        // SECURITY FIX: Authorization check - users can only upload documents for themselves
        if (!authorizationUtils.isAuthorized(userContext, userId)) {
            log.warn("Unauthorized document upload attempt: user={} attempted to upload for userId={}", 
                    userContext.getUser() != null ? userContext.getUser().getId() : "anonymous", userId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(UploadResponse.failure("Access denied: You can only upload documents for yourself"));
        }
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(UploadResponse.failure("file is required and cannot be empty"));
        }
        if (!StringUtils.hasText(file.getOriginalFilename())) {
            return ResponseEntity.badRequest().body(UploadResponse.failure("file name is required"));
        }

        DocumentVisibility visibility = parseVisibilityOrThrow(visibilityStr);

        UploadResponse response = documentService.uploadDocument(userId, file, visibility);

        if (response == null) {
            log.error("uploadDocument returned null for userId={}, file={}", userId, file.getOriginalFilename());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(UploadResponse.failure("Internal error"));
        }

        if (response.isSuccess()) {
            String location = "/api/documents/" + userId + "/" + response.getDocumentId();
            return ResponseEntity.created(URI.create(location)).body(response);
        } else {
            return ResponseEntity.badRequest().body(response);
        }
    }

    @Operation(summary = "Get a document", description = "Retrieve a specific document by user ID and document ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Document retrieved successfully",
                    content = @Content(schema = @Schema(implementation = DocumentDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid parameters"),
            @ApiResponse(responseCode = "404", description = "Document not found")
    })
    @GetMapping("/{userId}/{documentId}")
    public ResponseEntity<DocumentDto> getDocument(
            @Parameter(description = "User ID who owns the document", required = true)
            @PathVariable("userId") String userId,
            @Parameter(description = "Document ID to retrieve", required = true)
            @PathVariable("documentId") Long documentId) {
        log.info("Get document user={} id={}", userId, documentId);

        if (Objects.isNull(documentId) || documentId <= 0) {
            return ResponseEntity.badRequest().build();
        }

        // SECURITY FIX: Authorization check - users can only access their own documents
        if (!authorizationUtils.isAuthorized(userContext, userId)) {
            log.warn("Unauthorized document access attempt: user={} attempted to access document for userId={}", 
                    userContext.getUser() != null ? userContext.getUser().getId() : "anonymous", userId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        DocumentDto document = documentService.getDocument(userId, documentId);
        return ResponseEntity.ok(document);
    }

    @Operation(summary = "Get user documents", description = "Retrieve all documents for a specific user with pagination")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Documents retrieved successfully",
                    content = @Content(schema = @Schema(implementation = DocumentDto.class))),
            @ApiResponse(responseCode = "400", description = "Invalid parameters")
    })
    @GetMapping("/{userId}")
    public ResponseEntity<List<DocumentDto>> getDocumentsByUserId(
            @Parameter(description = "User ID to get documents for", required = true)
            @PathVariable("userId") String userId,
            @Parameter(description = "Page number (0-based)", example = "0")
            @RequestParam(value = "page", defaultValue = "0") int page,
            @Parameter(description = "Number of documents per page", example = "20")
            @RequestParam(value = "pageSize", defaultValue = "20") int pageSize) {

        log.info("Get documents for user={} page={} size={}",
                userId, page, pageSize);

        // SECURITY FIX: Authorization check - users can only access their own documents
        if (!authorizationUtils.isAuthorized(userContext, userId)) {
            log.warn("Unauthorized document list access attempt: user={} attempted to list documents for userId={}", 
                    userContext.getUser() != null ? userContext.getUser().getId() : "anonymous", userId);
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<DocumentDto> documents = documentService.getDocumentsByUserId(userId, page, pageSize);
        return ResponseEntity.ok(documents);
    }

    // --- helpers ---
    private DocumentVisibility parseVisibilityOrThrow(String visibilityStr) {
        if (!StringUtils.hasText(visibilityStr)) {
            throw new IllegalArgumentException("visibility parameter is required and must be 'public' or 'private'");
        }
        try {
            return DocumentVisibility.valueOf(visibilityStr.toUpperCase());
        } catch (IllegalArgumentException ex) {
            log.warn("Invalid visibility parameter: {}", visibilityStr);
            throw new IllegalArgumentException("Invalid visibility parameter: must be 'public' or 'private'");
        }
    }
}
