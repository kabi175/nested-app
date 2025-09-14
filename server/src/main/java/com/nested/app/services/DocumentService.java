package com.nested.app.services;

import java.io.IOException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.nested.app.buckets.S3Service;
import com.nested.app.dto.DocumentDto;
import com.nested.app.dto.UploadResponse;
import com.nested.app.entity.DocumentEntity;
import com.nested.app.enums.DocumentVisibility;
import com.nested.app.exception.DocumentNotFoundException;
import com.nested.app.repository.DocumentRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final S3Service s3Service;

    @Transactional
    public UploadResponse uploadDocument(String userId,
                                         MultipartFile file,
                                         DocumentVisibility visibility) {
        try {
            // ---- Validate input ----
            if (Objects.isNull(userId) || userId.isBlank()) {
                return UploadResponse.failure("User ID is required");
            }

            if (Objects.isNull(file) || file.isEmpty()) {
                return UploadResponse.failure("File is required and cannot be empty");
            }

            String originalFileName = file.getOriginalFilename();
            if (Objects.isNull(originalFileName) || originalFileName.isBlank()) {
                return UploadResponse.failure("File name is required");
            }

            if (Objects.isNull(visibility)) {
                return UploadResponse.failure("Document visibility is required");
            }

            // ---- Upload to S3 ----
            String s3Key = s3Service.uploadFile(file, visibility);

            // ---- Save metadata in DB ----
            DocumentEntity document = new DocumentEntity();
            document.setUserId(userId);
            document.setFileName(originalFileName);
            document.setS3Key(s3Key);
            document.setContentType(file.getContentType());
            document.setFileSize(file.getSize());
            document.setVisibility(visibility);

            DocumentEntity savedDocument = documentRepository.save(document);

            log.info("Document uploaded successfully with ID: {}", savedDocument.getId());

            return UploadResponse.success(savedDocument.getId(), savedDocument.getFileName());

        } catch (IOException e) {
            log.error("I/O error occurred while uploading document", e);
            return UploadResponse.failure("I/O error occurred while uploading document: " + e.getMessage());

        } catch (Exception e) {
            log.error("Unexpected error while uploading document", e);
            return UploadResponse.failure("Unexpected error occurred: " + e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public DocumentDto getDocument(String userId, Long documentId) {

        if (Objects.isNull(userId) || userId.isBlank()) {
            throw new IllegalArgumentException("User ID is required");
        }
        if (Objects.isNull(documentId)) {
            throw new IllegalArgumentException("Document ID cannot be null");
        }

        DocumentEntity document = documentRepository.findByIdAndUserId(documentId, userId)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found with ID: " + documentId));

        DocumentDto documentDto = DocumentDto.fromEntity(document);

        // Generate presigned URL
        String downloadUrl = s3Service.generatePresignedUrl(document.getS3Key(), document.getVisibility());
        documentDto.setDownloadUrl(downloadUrl);

        log.info("Retrieved document with ID: {}", documentId);

        return documentDto;
    }

    @Transactional(readOnly = true)
    public List<DocumentDto> getDocumentsByUserId(String userId, int page, int pageSize ) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("UserId cannot be null or empty");
        }

        log.debug("Fetching documents for userId={}", userId);

        // ---- Pagination ----
        Pageable pageable = PageRequest.of(page, pageSize);

        Page<DocumentEntity> documents = Optional.ofNullable(
                documentRepository.findByUserId(userId, pageable)
                ).orElse(Page.empty());
                

        return documents.stream()
                .map(this::mapToDtoWithDownloadUrl)
                .toList();
    }

    @Transactional
    public void deleteDocument(Long documentId) {
        if (Objects.isNull(documentId)) {
            throw new IllegalArgumentException("Document ID cannot be null");
        }

        DocumentEntity document = documentRepository.findById(documentId)
                .orElseThrow(() -> new DocumentNotFoundException("Document not found with ID: " + documentId));

        try {
            // First delete DB record (ensures no orphan metadata if S3 fails)
            documentRepository.delete(document);

            // Then delete from S3
            s3Service.deleteFile(document.getS3Key(), document.getVisibility());

            log.info("Document deleted successfully with ID: {}", documentId);

        } catch (Exception e) {
            log.error("Error deleting document with ID: {}", documentId, e);
            throw new RuntimeException("Failed to delete document with ID: " + documentId, e);
        }
    }

    private DocumentDto mapToDtoWithDownloadUrl(DocumentEntity document) {
        DocumentDto dto = DocumentDto.fromEntity(document);
        dto.setDownloadUrl(s3Service.generatePresignedUrl(
                document.getS3Key(),
                document.getVisibility()
        ));
        return dto;
    }
}
