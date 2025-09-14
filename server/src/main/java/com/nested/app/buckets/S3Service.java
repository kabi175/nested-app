package com.nested.app.buckets;

import java.io.IOException;
import java.net.URL;
import java.time.Duration;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.nested.app.enums.DocumentVisibility;

import io.micrometer.common.lang.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {
    
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    
    @Value("${aws.s3.presigned.url.expiration.hours:24}")
    private long presignedUrlExpirationHours;

    @Value("${aws.s3.bucket.public:}")
    private String publicBucketName;

    @Value("${aws.s3.bucket.private:}")
    private String privateBucketName;
    
    //TODO: Make this possible to handle many requests at the same time
    public String uploadFile(@NonNull MultipartFile file, DocumentVisibility visibility) throws IOException {
        log.info("Uploading file to s3");
        String fileName = file.getOriginalFilename();
        log.info("File name : {}", fileName);
        String fileExtension = fileName.substring(fileName.lastIndexOf("."));
        String s3Key = generateS3Key(fileExtension);
        log.info("s3 key : {}", s3Key);
        String bucketName = visibility == DocumentVisibility.PUBLIC ? publicBucketName : privateBucketName;
        log.info("visibility : {}", bucketName);
        
        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();
            
            s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            
            log.info("File uploaded successfully to S3 with key: {}", s3Key);
            return s3Key;
            
        } catch (S3Exception e) {
            log.error("Error uploading file to S3: {}", e.getMessage());
            throw new RuntimeException("Failed to upload file to S3", e);
        }
    }
    
    public String generatePresignedUrl(String s3Key,DocumentVisibility visibility) {

        String bucketName = visibility == DocumentVisibility.PUBLIC ? publicBucketName : privateBucketName;

        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();
            
            GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofHours(presignedUrlExpirationHours))
                    .getObjectRequest(getObjectRequest)
                    .build();
            
            PresignedGetObjectRequest presignedRequest = s3Presigner.presignGetObject(presignRequest);
            URL url = presignedRequest.url();
            
            log.info("Generated presigned URL for S3 key: {}", s3Key);
            return url.toString();
            
        } catch (S3Exception e) {
            log.error("Error generating presigned URL for S3 key {}: {}", s3Key, e.getMessage());
            throw new RuntimeException("Failed to generate presigned URL", e);
        }
    }
    
    public void deleteFile(String s3Key, DocumentVisibility visibility) {

        String bucketName = visibility == DocumentVisibility.PUBLIC ? publicBucketName : privateBucketName;

        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(s3Key)
                    .build();
            
            s3Client.deleteObject(deleteObjectRequest);
            log.info("File deleted successfully from S3 with key: {}", s3Key);
            
        } catch (S3Exception e) {
            log.error("Error deleting file from S3 with key {}: {}", s3Key, e.getMessage());
            throw new RuntimeException("Failed to delete file from S3", e);
        }
    }
    
    private String generateS3Key(String fileExtension) {
        String uuid = UUID.randomUUID().toString();
        return uuid + fileExtension;
    }
}
