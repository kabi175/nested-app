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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping(
    value = "/api/v1/users/user_id}/actions/reverse-penny-drop",
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
            content = @Content(schema = @Schema(implementation = ReversePennyDropResponse.class))),
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
            .id(resp.getData().getTransactionId())
            .type("reverse_penny_drop")
            .redirectUrl(resp.getData().getUpi())
            .build();
    return ResponseEntity.status(HttpStatus.CREATED).body(body);
  }
}
