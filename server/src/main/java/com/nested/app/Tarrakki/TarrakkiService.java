package com.nested.app.Tarrakki;

import com.nested.app.client.tarrakki.TarrakkiTokenProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

/**
 * Service for interacting with Tarrakki API
 */
@Slf4j
@Service
public class TarrakkiService {

    private final WebClient webClient;
    private final TarrakkiTokenProvider tokenProvider;
    private final String baseUrl;

    public TarrakkiService(
            WebClient.Builder webClientBuilder,
            TarrakkiTokenProvider tokenProvider,
            @Value("${tarrakki.api.base-url}") String baseUrl
    ) {
        this.baseUrl = baseUrl;
        this.webClient = webClientBuilder.baseUrl(baseUrl).build();
        this.tokenProvider = tokenProvider;
        log.info("TarrakkiService initialized with base URL: {}", baseUrl);
    }

    /**
     * Adds authorization header to the request
     *
     * @param spec the request header spec
     * @return the request header spec with authorization header
     */
    private WebClient.RequestHeadersSpec<?> withAuth(WebClient.RequestHeadersSpec<?> spec) {
        String token = tokenProvider.getToken();
        log.debug("Adding authorization header to request");
        return spec.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
    }

    /**
     * Retrieves user profile from Tarrakki API
     *
     * @return the user profile as JSON string
     * @throws WebClientResponseException if the API request fails
     */
    public String getAllInvestors() {
        log.info("Fetching all investors}");
        
        try {
            String response = withAuth(webClient.get().uri("investors"))
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();
            
            log.debug("Successfully retrieved all investors");
            return response;
        } catch (WebClientResponseException e) {
            log.error("Failed to fetch all investors. Status: {}, Response: {}",
                    e.getStatusCode(), e.getResponseBodyAsString(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while fetching all investors", e);
            throw e;
        }
    }
}
