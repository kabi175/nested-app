package com.nested.app.client.finprimitives;

import java.time.Instant;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;

/**
 * Provider for managing FinPrimitives OAuth tokens with caching (using RestTemplate)
 */
@Slf4j
@Component
public class FinPrimitivesTokenProvider {

    private static final long TOKEN_BUFFER_SECONDS = 30L;
    private static final String GRANT_TYPE = "client_credentials";

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String clientId;
    private final String clientSecret;
    private final String tenant;

    private String cachedToken;
    private Instant expiryTime;

    public FinPrimitivesTokenProvider(
            RestTemplate restTemplate,
            @Value("${finprimitives.api.base-url}") String baseUrl,
            @Value("${finprimitives.api.client-id}") String clientId,
            @Value("${finprimitives.api.client-secret}") String clientSecret,
            @Value("${finprimitives.api.tenant}") String tenant
    ) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.tenant = tenant;
        log.info("FinPrimitivesTokenProvider initialized for base URL: {}", baseUrl);
    }

    /**
     * Retrieves a valid access token, fetching a new one if the cached token is expired
     */
    public synchronized String getToken() {
        if (isTokenExpired()) {
            log.debug("Token is expired or not present, fetching new token (FinPrimitives)");
            fetchAndCacheToken();
        } else {
            log.debug("Using cached token (FinPrimitives)");
        }
        return cachedToken;
    }

    private boolean isTokenExpired() {
        return cachedToken == null || expiryTime == null || Instant.now().isAfter(expiryTime);
    }

    private void fetchAndCacheToken() {
        try {
            log.info("Requesting new access token from FinPrimitives OAuth endpoint");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("client_id", clientId);
            form.add("client_secret", clientSecret);
            form.add("grant_type", GRANT_TYPE);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);

            ResponseEntity<TokenResponse> response = restTemplate.exchange(
                    baseUrl + "/v2/auth/ "+ tenant +"/token",
                    HttpMethod.POST,
                    request,
                    TokenResponse.class
            );

            TokenResponse body = response.getBody();
            if (body == null) {
                log.error("Received null response from FinPrimitives token endpoint");
                throw new IllegalStateException("Failed to fetch access token: null response");
            }

            Long expiresIn = body.getExpiresIn();
            cacheToken(body);
            log.info("Successfully fetched and cached new FinPrimitives access token. Expires in: {} seconds",
                    expiresIn != null ? expiresIn : -1);

        } catch (HttpStatusCodeException e) {
            log.error("Failed to fetch FinPrimitives access token. Status: {}, Response: {}",
                    e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while fetching FinPrimitives access token", e);
            throw e;
        }
    }

    private void cacheToken(TokenResponse response) {
        this.cachedToken = response.getAccessToken();
        Long expiresInRemote = response.getExpiresIn();
        long expiresIn = (expiresInRemote == null) ? 300L : expiresInRemote;
        this.expiryTime = Instant.now().plusSeconds(expiresIn - TOKEN_BUFFER_SECONDS);
        log.debug("FinPrimitives token cached. Expiry time: {}", expiryTime);
    }

    @Data
    public static class TokenResponse {
        private String access_token;
        private Long expires_in;

        public String getAccessToken() {
            return access_token;
        }

        public Long getExpiresIn() {
            return expires_in;
        }
    }
}


