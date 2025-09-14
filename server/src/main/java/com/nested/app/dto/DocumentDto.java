package com.nested.app.dto;

import com.nested.app.entity.DocumentEntity;
import com.nested.app.enums.DocumentVisibility;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentDto {
    
    private Long id;
    private String userId;
    private String fileName;
    private String contentType;
    private DocumentVisibility visibility;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String downloadUrl;
    
    public static DocumentDto fromEntity(DocumentEntity entity) {
        return new DocumentDto(
                entity.getId(),
                entity.getUserId(),
                entity.getFileName(),
                entity.getContentType(),
                entity.getVisibility(),
                entity.getCreatedAt(),
                entity.getUpdatedAt(),
                null // downloadUrl will be set by service
        );
    }
}
