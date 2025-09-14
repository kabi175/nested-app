package com.nested.app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UploadResponse {
    
    private Long documentId;
    private String fileName;
    private String message;
    private boolean success;
    
    public static UploadResponse success(Long documentId, String fileName) {
        return new UploadResponse(documentId, fileName, "Document uploaded successfully", true);
    }
    
    public static UploadResponse failure(String message) {
        return new UploadResponse(null, null, message, false);
    }
}
