package com.nested.app.client.bulkpe;

import com.nested.app.client.bulkpe.dto.PrefilRequest;
import com.nested.app.client.bulkpe.dto.PrefillErrorResponse;
import com.nested.app.client.bulkpe.dto.PrefillResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

/**
 * Client to call Bulkpe Prefill API. Wraps WebClient from BulkpeApi and fetches user-specific fund
 * details.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PrefilClient {

  // API path for the prefill endpoint
  private static final String PREFILL_API_URL = "/prefill";

  private final BulkpeApi bulkpeApi;

  /**
   * Fetch detailed fund information for a user from Bulkpe Prefill API. Uses the authenticated
   * WebClient from BulkpeApi.
   *
   * @return Mono emitting PrefillResponse on success
   */
  public Mono<PrefillResponse> fetchFullDetailsForTheUser(PrefilRequest request) {
    return bulkpeApi
        .withAuth()
        .post()
        .uri(PREFILL_API_URL)
        .bodyValue(request)
        .retrieve()
        .onStatus(
            status -> status.is4xxClientError() || status.is5xxServerError(),
            clientResponse ->
                clientResponse
                    .bodyToMono(PrefillErrorResponse.class)
                    .flatMap(
                        error -> {
                          log.error("Prefill API error: {}", error.getMessage());
                          return Mono.error(new RuntimeException(error.getMessage()));
                        }))
        .bodyToMono(PrefillResponse.class)
        .doOnSuccess(
            res -> log.info("Prefill response received for reference={}", request.getReference()));
  }
}
