package com.nested.app.client.bulkpe;

import com.nested.app.client.bulkpe.dto.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

/**
 * Client responsible for interacting with the Bulkpe Reverse Penny Drop API. This API validates
 * bank account details by performing a small credit/debit transaction and returning the result
 * along with a UPI payment link.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ReversePennyDropClient {

  // Endpoint path for initiating the reverse penny drop transaction
  private static final String REVERSE_PENNY_DROP_API_URL = "/reversePennyDrop";

  private final BulkpeApi bulkpeApi;

  /**
   * Initiates a Reverse Penny Drop request to Bulkpe API.
   *
   * <p>This method:
   *
   * <ul>
   *   <li>Sends an authenticated POST request to Bulkpe’s Reverse Penny Drop endpoint.
   *   <li>Handles 4xx and 5xx responses with custom error logging.
   *   <li>Returns the parsed response wrapped in a Reactor {@link Mono}.
   * </ul>
   *
   * @param request the {@link ReversePennyDropRequest} containing transaction details
   * @return a {@link Mono} emitting {@link ReversePennyDropResponse} on success
   */
  public Mono<ReversePennyDropResponse> getReversePennyDropUrl(ReversePennyDropRequest request) {

      log.info("Initiating Reverse Penny Drop for referenceId={}", request.getReferenceId());

    return bulkpeApi
        .withAuth()
        .post()
        .uri(REVERSE_PENNY_DROP_API_URL)
        .bodyValue(request)
        .retrieve()
        .onStatus(
            status -> status.is4xxClientError() || status.is5xxServerError(),
            clientResponse ->
                clientResponse
                    .bodyToMono(String.class)
                    .flatMap(
                        error -> {
                          log.error(
                              "Reverse Penny Drop API returned error for referenceId={}: {}",
                              request.getReferenceId(),
                                  clientResponse.statusCode().value());
                          return Mono.error(new RuntimeException(error));
                        }))
        .bodyToMono(ReversePennyDropResponse.class)
        .doOnSuccess(
            response ->
                log.info(
                    "Reverse Penny Drop success for referenceId={}, transactionId={}, status={}",
                    request.getReferenceId(),
                    response.getData() != null ? response.getData().getMessage() : "N/A",
                    response.getData() != null ? response.getData().getStatus() : "N/A"))
        .doOnError(
            error ->
                log.error(
                    "Reverse Penny Drop failed for referenceId={} with error={}",
                    request.getReferenceId(),
                    error.getMessage()));
  }
}
