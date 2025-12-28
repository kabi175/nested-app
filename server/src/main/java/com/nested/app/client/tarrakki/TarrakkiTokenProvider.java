package com.nested.app.client.tarrakki;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import lombok.Data;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

/**
 * Provider for managing Tarrakki API OAuth tokens with caching (using RestTemplate)
 */
@Slf4j
@Component
public class TarrakkiTokenProvider {

    //TODO check do we need buffer time?
    private static final long TOKEN_BUFFER_SECONDS = 30L;
    private static final String GRANT_TYPE = "client_credentials";

    private final RestTemplate restTemplate;
    private final String baseUrl;
    private final String clientId;
    private final String clientSecret;

    private String cachedToken;
    private Instant expiryTime;

    public TarrakkiTokenProvider(
            RestTemplate restTemplate,
            @Value("${tarrakki.api.base-url}") String baseUrl,
            @Value("${tarrakki.api.client-id}") String clientId,
            @Value("${tarrakki.api.client-secret}") String clientSecret
    ) {
        this.restTemplate = restTemplate;
        this.baseUrl = baseUrl;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        log.info("TarrakkiTokenProvider initialized for base URL: {}", baseUrl);
    }

    /**
     * Retrieves a valid access token, fetching a new one if the cached token is expired
     */
    public synchronized String getToken() {
        if (isTokenExpired()) {
            log.debug("Token is expired or not present, fetching new token");
            fetchAndCacheToken();
        } else {
            log.debug("Using cached token");
        }
        return cachedToken;
    }

    private boolean isTokenExpired() {
        return cachedToken == null || expiryTime == null || Instant.now().isAfter(expiryTime);
    }

    private void fetchAndCacheToken() {
        try {
            log.info("Requesting new access token from Tarrakki OAuth endpoint");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> body = buildTokenRequestBody();
            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<TokenResponse> response = restTemplate.exchange(
                    baseUrl + "/access_token",
                    HttpMethod.POST,
                    request,
                    TokenResponse.class
            );

            if (response.getBody() == null) {
                log.error("Received null response from token endpoint");
                throw new IllegalStateException("Failed to fetch access token: null response");
            }

            cacheToken(response.getBody());
            log.info("Successfully fetched and cached new access token. Expires in: {} seconds",
                    response.getBody().getExpiresIn());

        } catch (HttpStatusCodeException e) {
            log.error("Failed to fetch access token. Status: {}, Response: {}",
                    e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while fetching access token", e);
            throw e;
        }
    }

    private Map<String, String> buildTokenRequestBody() {
        Map<String, String> body = new HashMap<>();
        body.put("client_id", clientId);
        body.put("client_secret", clientSecret);
        body.put("grant_type", GRANT_TYPE);
        return body;
    }

    private void cacheToken(TokenResponse response) {
        this.cachedToken = response.getAccessToken();
        this.expiryTime = Instant.now().plusSeconds(response.getExpiresIn() - TOKEN_BUFFER_SECONDS);
        log.debug("Token cached. Expiry time: {}", expiryTime);
    }

  @Data
  @Getter
  public static class TokenResponse {
    private String accessToken;
    private long expiresIn;
    }
}
