package com.nested.app.controllers;

import com.nested.app.contect.UserContext;
import com.nested.app.dto.BankAccountDto;
import com.nested.app.dto.Entity;
import com.nested.app.dto.MinifiedUserDTO;
import com.nested.app.dto.UserActionRequest;
import com.nested.app.dto.UserDTO;
import com.nested.app.entity.User;
import com.nested.app.services.InvestorService;
import com.nested.app.services.KycService;
import com.nested.app.services.UserService;
import com.nested.app.utils.AppEnvironment;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.view.RedirectView;

@Slf4j
@Validated
@RestController
@AllArgsConstructor
@RequestMapping("/api/v1/users")
public class UserController {

  private final UserService userService;
  private final InvestorService investorService;
  private final KycService kycService;
  private final UserContext userContext;
  private final AppEnvironment appEnvironment;

  @GetMapping(produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(
      tags = "user",
      summary = "Get users",
      description = "Get current user or all users (admin only for ALL)")
  @ApiResponses(
      value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved users"),
        @ApiResponse(responseCode = "204", description = "No users found"),
        @ApiResponse(
            responseCode = "403",
            description = "Access denied - Admin role required for type ALL")
      })
  public ResponseEntity<?> getUsers(
      @RequestParam(defaultValue = "CURRENT_USER") UserService.Type type,
      @PageableDefault(sort = "id") Pageable pageable) {

    // Check if user is trying to access ALL users without admin role
    // Skip check in development mode
    if (!appEnvironment.isDevelopment()
        && (type == UserService.Type.ALL
            || type == UserService.Type.ACTIVE
            || type == UserService.Type.INACTIVE)) {
      User currentUser = userContext.getUser();
      if (currentUser == null || !User.Role.ADMIN.equals(currentUser.getRole())) {
        log.warn("Non-admin user attempted to access all users");
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
            .body(Map.of("error", "Access denied - Admin role required"));
      }
    }

    var users = userService.findAllUsers(type, pageable);
    if (users.isEmpty()) {
      return ResponseEntity.noContent().build();
    }
    return ResponseEntity.ok(Entity.of(users));
  }

  @PatchMapping(
      path = "/{id}",
      consumes = MediaType.APPLICATION_JSON_VALUE,
      produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(tags = "user")
  public ResponseEntity<UserDTO> updateUser(
      @PathVariable Long id, @org.springframework.web.bind.annotation.RequestBody UserDTO userDTO) {
    userDTO.setId(id);
    UserDTO updatedUser = userService.updateUser(userDTO);
    return ResponseEntity.ok(updatedUser);
  }

  @PostMapping("/{user_id}/actions/create_investor")
  @Operation(
      tags = "user",
      summary = "Create investor for user",
      description =
          "Creates an investor profile in Tarrakki for the specified user (individual type)")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "Investor created successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input data or missing required fields"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "409", description = "Investor already exists for this user"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> createInvestor(
      @Parameter(description = "User ID", required = true) @PathVariable("user_id") Long userId) {
    var userDto = new MinifiedUserDTO();
    userDto.setId(userId);
    investorService.createInvestor(userDto);

    log.info("Successfully created investor for user ID: {}", userId);

    return ResponseEntity.status(HttpStatus.CREATED).build();
  }

  @PostMapping("/{user_id}/actions/init_kyc")
  @Operation(
      tags = "user",
      summary = "Initiate KYC for user",
      description = "Initiates KYC (Know Your Customer) process for the specified user")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "200",
            description = "KYC initiated successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input data or missing required fields"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error or KYC service unavailable")
      })
  public ResponseEntity<?> initiateKyc(
      @Parameter(description = "User ID", required = true) @PathVariable("user_id") Long userId) {
    kycService.initiateKyc(userId);

    return ResponseEntity.ok().build();
  }

  @PostMapping(
      value = "/{user_id}/actions/aadhaar_upload",
      produces = MediaType.APPLICATION_JSON_VALUE)
  @Operation(
      tags = "user",
      summary = "Upload Aadhaar for user",
      description = "Initiates Aadhaar upload for the specified user and returns an action request")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "Aadhaar upload initiated successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = UserActionRequest.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input data or missing required fields"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(
            responseCode = "500",
            description = "Internal server error or Aadhaar service unavailable")
      })
  public ResponseEntity<UserActionRequest> uploadAadhaar(
      @Parameter(description = "User ID", required = true) @PathVariable("user_id") Long userId,
      @Parameter(description = "KYC Request ID", required = true) @RequestParam("kyc_request_id")
          String kycRequestId) {
    UserActionRequest response = userService.createAadhaarUploadRequest(userId, kycRequestId);

    log.info("Aadhaar upload initiated for user ID: {}", userId);

    return ResponseEntity.status(HttpStatus.CREATED).body(response);
  }

  @PostMapping(value = "/{user_id}/banks", consumes = MediaType.APPLICATION_JSON_VALUE)
  @Operation(
      tags = "bank-account",
      summary = "Add bank account for User",
      description = "Add bank account for User")
  @ApiResponses(
      value = {
        @ApiResponse(
            responseCode = "201",
            description = "Bank account added successfully",
            content =
                @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = Map.class))),
        @ApiResponse(
            responseCode = "400",
            description = "Invalid input data or missing required fields"),
        @ApiResponse(responseCode = "404", description = "User not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
      })
  public ResponseEntity<?> addBankAccount(
      @Parameter(description = "User ID", required = true) @PathVariable("user_id") Long userID,
      @Validated @org.springframework.web.bind.annotation.RequestBody
          BankAccountDto bankAccountDto) {
    var bank = userService.addBankAccount(userID, bankAccountDto);

    return ResponseEntity.status(HttpStatus.CREATED).body(bank);
  }

  @Operation(
      tags = "bank-account",
      summary = "fetch bank account for User",
      description = "fetch bank account for User")
  @GetMapping(value = "/{user_id}/banks", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<Entity<BankAccountDto>> getBankAccounts(
      @Parameter(description = "User ID", required = true) @PathVariable("user_id") Long userID) {
    var banks = userService.fetchBankAccounts(userID);
    if (banks == null || banks.isEmpty()) {
      return ResponseEntity.noContent().build();
    }

    return ResponseEntity.ok(Entity.of(banks));
  }

  @Operation(
      tags = "bank-account",
      summary = "delete a bank account for User",
      description = "delete a bank account for User")
  @DeleteMapping(value = "/{user_id}/banks/{bank_id}", produces = MediaType.APPLICATION_JSON_VALUE)
  public ResponseEntity<Entity<BankAccountDto>> deleteBankAccounts(
      @Parameter(description = "User ID", required = true) @PathVariable("user_id") Long userID,
      @Parameter(description = "Bank Account ID", required = true) @PathVariable("bank_id")
          Long bankAccountID) {
    userService.deleteBankAccount(userID, bankAccountID);

    return ResponseEntity.accepted().build();
  }

  @PostMapping(value = "/{user_id}/signature", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  @Operation(tags = "user", summary = "Upload user signature")
  public ResponseEntity<?> uploadSignature(
      @PathVariable("user_id") Long userID, @RequestParam("file") MultipartFile file) {
    userService.uploadUserSignature(userID, file);
    return ResponseEntity.ok(Map.of("message", "Signature uploaded successfully"));
  }

  @GetMapping(value = "/{user_id}/signature")
  @Operation(tags = "user", summary = "Upload user signature")
  public RedirectView getSignature(@PathVariable("user_id") Long userID) {
    var url = userService.fetchUserSignature(userID);
    return new RedirectView(url);
  }
}
