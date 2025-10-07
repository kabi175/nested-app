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

import com.nested.app.client.bulkpe.dto.ReversePennyDropRequest;
import com.nested.app.client.bulkpe.dto.ReversePennyDropResponse;
import com.nested.app.services.ReversePennyDropService;

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
@RequestMapping(value = "/api/v1/reverse-penny-drop", produces = MediaType.APPLICATION_JSON_VALUE)
@Tag(name = "Reverse Penny Drop", description = "Initiate Bulkpe reverse penny drop validation")
public class ReversePennyDropController {

  private final ReversePennyDropService reversePennyDropService;

  @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
  @Operation(summary = "Initiate reverse penny drop", description = "Returns upi url and transaction details")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "201", description = "Initiated successfully", content = @Content(schema = @Schema(implementation = ReversePennyDropResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content(schema = @Schema(implementation = Map.class))),
        @ApiResponse(responseCode = "500", description = "Internal error")
      })
  public ResponseEntity<?> initiate() {
    log.info("POST /api/v1/reverse-penny-drop");
    try {
      ReversePennyDropResponse resp = reversePennyDropService.initiate();
      return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      log.error("Reverse penny drop failed: {}", e.getMessage(), e);
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to initiate reverse penny drop"));
    }
  }
}


