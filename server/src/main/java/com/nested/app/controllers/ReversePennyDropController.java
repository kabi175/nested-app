package com.nested.app.controllers;

import com.nested.app.client.bulkpe.dto.ReversePennyDropResponse;
import com.nested.app.dto.UserActionRequest;
import com.nested.app.services.ReversePennyDropService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Slf4j
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping(
    value = "/api/v1/users/{user_id}/actions/reverse-penny-drop",
    produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "bank-account", description = "Initiate Bulkpe reverse penny drop" + " " + "validation")
public class ReversePennyDropController {

  private final ReversePennyDropService reversePennyDropService;

  @PostMapping(produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(
      summary = "Initiate reverse penny drop",
      description = "Returns upi url and transaction details")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "Initiated successfully",
            content = @Content(schema = @Schema(implementation = UserActionRequest.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input",
            content = @Content(schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "500", description = "Internal error")
      })
  public ResponseEntity<?> initiate(
      @Parameter(description = "User ID", required = true) @PathVariable("user_id") Long userID) {
    ReversePennyDropResponse resp = reversePennyDropService.initiate(userID);
    var body =
        UserActionRequest.builder()
            .id(resp.getData().getReferenceId())
            .type("reverse_penny_drop")
            .redirectUrl(resp.getData().getUpi())
            .build();
    return ResponseEntity.status(HttpStatus.CREATED).body(body);
  }

  @GetMapping(value = "/status/{reference_id}", produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(
          summary = "Get Reverse Penny Drop Status",
          description = "Returns the UPI URL and transaction details for the given reference ID")
  @ApiResponses(
          value = {
                  @ApiResponse(
                          responseCode = "200",
                          description = "Fetched successfully",
                          content = @Content(schema = @Schema(implementation = UserActionRequest.class))),
                  @ApiResponse(
                          responseCode = "400",
                          description = "Invalid input",
                          content = @Content(schema = @Schema(implementation = Map.class))),
                  @ApiResponse(responseCode = "500", description = "Internal error")
          })
  public ResponseEntity<?> getStatusOfReversePennyDrop(
          @Parameter(description = "User ID", required = true) @PathVariable("user_id") Long userID,
          @Parameter(description = "Reference ID of penny drop", required = true) @PathVariable("reference_id") String referenceId) {

    try {
      log.info("Fetching Reverse Penny Drop status for userId={} and referenceId={}", userID, referenceId);

      ReversePennyDropResponse resp = reversePennyDropService.getStatusOfPennyDrop(userID, referenceId);

      // Validate the response structure
      if (resp == null || resp.getData() == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "No Reverse Penny Drop record found for the given reference ID."));
      }

      return ResponseEntity
              .status(HttpStatus.OK)
              .body(Map.of("status", resp.getData().getStatus()));

    } catch (IllegalArgumentException e) {
      log.warn("Invalid input for Reverse Penny Drop: {}", e.getMessage());
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));

    } catch (Exception e) {
      log.error("Failed to fetch Reverse Penny Drop status: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
              .body(Map.of("error", "Failed to retrieve reverse penny drop status."));
    }
  }

}
