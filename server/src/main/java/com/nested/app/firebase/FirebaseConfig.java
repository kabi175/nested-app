package com.nested.app.firebase;

import java.io.IOException;
import java.io.InputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
public class FirebaseConfig {

    private final ResourceLoader resourceLoader;

    @Value("${firebase.service.account.path:file}")
    private String serviceAccountPath;

    public FirebaseConfig(ResourceLoader resourceLoader) {
        this.resourceLoader = resourceLoader;
    }

    @Bean
    public FirebaseApp firebaseApp() throws IOException {
        log.info("Initializing Firebase with service account from: {}", serviceAccountPath);
        
        InputStream serviceAccountStream;
        
        // Try to load from environment variable first (for production)
        String serviceAccountJson = System.getenv("FIREBASE_SERVICE_ACCOUNT_JSON");
        if (serviceAccountJson != null && !serviceAccountJson.isEmpty()) {
            log.info("Using Firebase credentials from FIREBASE_SERVICE_ACCOUNT_JSON environment variable");
            serviceAccountStream = new java.io.ByteArrayInputStream(serviceAccountJson.getBytes());
        } else {
            // Load from classpath or file system
            Resource resource = resourceLoader.getResource(serviceAccountPath);
            
            if (!resource.exists()) {
                throw new IOException("Firebase service account file not found at: " + serviceAccountPath);
            }
            
            // Use getInputStream() instead of getFile() - works in JAR and Docker
            serviceAccountStream = resource.getInputStream();
            log.info("Loaded Firebase credentials from: {}", serviceAccountPath);
        }

        FirebaseOptions options = FirebaseOptions.builder()
                .setCredentials(GoogleCredentials.fromStream(serviceAccountStream))
                .build();

        if (FirebaseApp.getApps().isEmpty()) {
            log.info("Firebase App initialized successfully");
            return FirebaseApp.initializeApp(options);
        } else {
            log.info("Firebase App already initialized, returning existing instance");
            return FirebaseApp.getInstance();
        }
    }
}
