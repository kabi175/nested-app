package com.nested.app.controllers;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nested.app.client.bulkpe.dto.BulkpeWebhookPayload;
import com.nested.app.services.BulkpeWebhookService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/public/webhooks/bulkpe", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Bulkpe Webhook", description = "Public webhook receiver for Bulkpe credit events")
public class BulkpeWebhookController {

  private final BulkpeWebhookService bulkpeWebhookService;

  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  @Operation(summary = "Receive Bulkpe credit webhook")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Received", content = @Content(schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "400", description = "Invalid payload")
      })
  public ResponseEntity<?> receive(@Validated @RequestBody BulkpeWebhookPayload payload) {
    try {
      bulkpeWebhookService.handleCredit(payload);
      return ResponseEntity.ok(Map.of("received", true));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      log.error("Bulkpe webhook processing failed: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.OK).body(Map.of("received", true));
    }
  }
}


