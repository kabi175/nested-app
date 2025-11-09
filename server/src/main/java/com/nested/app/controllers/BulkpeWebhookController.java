package com.nested.app.controllers;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nested.app.client.bulkpe.dto.BulkpeWebhookRequest;
import com.nested.app.services.BulkpeWebhookService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Controller for handling Bulkpe webhook requests
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/public/webhooks/bulkpe", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Bulkpe Webhook", description = "Webhook endpoints for Bulkpe reverse penny drop notifications")
public class BulkpeWebhookController {

    private final BulkpeWebhookService bulkpeWebhookService;

    @PostMapping(value = "/reverse-penny-drop", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Handle reverse penny drop webhook", 
               description = "Accepts webhook notifications from Bulkpe for reverse penny drop transactions and updates bank details")
    @ApiResponses(
        value = {
            @ApiResponse(responseCode = "200", description = "Webhook processed successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid webhook data", 
                        content = @Content(schema = @Schema(implementation = Map.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error",
                        content = @Content(schema = @Schema(implementation = Map.class)))
        })
    public ResponseEntity<?> handleReversePennyDropWebhook(@RequestBody BulkpeWebhookRequest webhookRequest) {
        log.info("Received Bulkpe reverse penny drop webhook: referenceId={}, status={}", 
                webhookRequest.getData() != null ? webhookRequest.getData().getReferenceId() : "N/A",
                webhookRequest.isStatus());
        
        try {
            boolean processed = bulkpeWebhookService.processWebhook(webhookRequest);
            
            if (processed) {
                return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Webhook processed successfully"
                ));
            } else {
                log.warn("Webhook processing failed or skipped");
                String detailedMessage = getDetailedMessage(webhookRequest);

                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "status", "failed",
                    "message", detailedMessage
                ));
            }
        } catch (Exception e) {
            log.error("Error processing Bulkpe webhook: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "status", "error",
                "message", "Internal server error while processing webhook"
            ));
        }
    }

    private static String getDetailedMessage(BulkpeWebhookRequest webhookRequest) {
        String referenceId = webhookRequest.getData() != null ? webhookRequest.getData().getReferenceId() : null;
        String accountNumber = webhookRequest.getData() != null ? webhookRequest.getData().getRemitterAccountNumber() : null;
        String ifscCode = webhookRequest.getData() != null ? webhookRequest.getData().getRemitterIfsc() : null;

        String detailedMessage = "Webhook processing failed. ";
        if (webhookRequest.getData() != null && !"SUCCESS".equalsIgnoreCase(webhookRequest.getData().getTrxStatus())) {
            detailedMessage += "Transaction status is not SUCCESS.";
        } else {
            detailedMessage += "No matching bank detail found. ";
            detailedMessage += "Please ensure a bank detail exists with refId='" + referenceId + "' ";
            detailedMessage += "or accountNumber='" + accountNumber + "' and ifscCode='" + ifscCode + "'.";
        }
        return detailedMessage;
    }
}

