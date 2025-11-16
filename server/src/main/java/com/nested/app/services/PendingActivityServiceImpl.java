package com.nested.app.services;

import com.nested.app.dto.ActivitySummaryDTO;
import com.nested.app.dto.GoalDTO;
import com.nested.app.dto.MinifiedUserDTO;
import com.nested.app.dto.PendingActivityDTO;
import com.nested.app.dto.PendingActivityResponseDTO;
import com.nested.app.entity.Goal;
import com.nested.app.entity.User;
import com.nested.app.enums.ActivityPriority;
import com.nested.app.enums.ActivityType;
import com.nested.app.repository.GoalRepository;
import com.nested.app.repository.UserRepository;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PendingActivityServiceImpl implements PendingActivityService {

  private final GoalRepository goalRepository;
  private final UserRepository userRepository;

  @Override
  public PendingActivityResponseDTO getPendingActivities(
      Long userId, ActivityType type, ActivityPriority priority) {
    log.info("Fetching pending activities for user: {}", userId);

    List<PendingActivityDTO<?>> activities = new ArrayList<>();

    // Get user details
    Optional<User> userOptional = userRepository.findById(userId);
    if (userOptional.isEmpty()) {
      log.warn("User not found: {}", userId);
      return buildEmptyResponse(userId);
    }

    User user = userOptional.get();

    // Check KYC status
    if (type == null || type == ActivityType.KYC_INCOMPLETE) {
      PendingActivityDTO<?> kycActivity = checkKycStatus(user);
      if (kycActivity != null) {
        activities.add(kycActivity);
      }
    }

    // Check for goals with pending payments
    if (type == null || type == ActivityType.GOAL_PAYMENT_PENDING) {
      List<PendingActivityDTO<?>> goalActivities = checkPendingGoalPayments(userId);
      activities.addAll(goalActivities);
    }

    // Check for profile completion
    if (type == null || type == ActivityType.PROFILE_INCOMPLETE) {
      PendingActivityDTO<?> profileActivity = checkProfileCompletion(user);
      if (profileActivity != null) {
        activities.add(profileActivity);
      }
    }

    // Check for bank account details
    if (type == null || type == ActivityType.BANK_ACCOUNT_PENDING) {
      PendingActivityDTO<?> bankActivity = checkBankAccountStatus(user);
      if (bankActivity != null) {
        activities.add(bankActivity);
      }
    }

    // Apply priority filter if provided
    List<PendingActivityDTO<?>> filteredActivities = activities;
    if (priority != null) {
      filteredActivities =
          activities.stream()
              .filter(activity -> activity.getPriority() == priority)
              .collect(Collectors.toList());
    }

    // Sort by priority (HIGH -> MEDIUM -> LOW) and then by createdAt
    filteredActivities.sort(
        Comparator.<PendingActivityDTO<?>, ActivityPriority>comparing(
                PendingActivityDTO::getPriority, Comparator.reverseOrder())
            .thenComparing(PendingActivityDTO::getCreatedAt));
    // Build summary
    ActivitySummaryDTO summary = buildSummary(filteredActivities);

    return PendingActivityResponseDTO.builder()
        .userId(userId)
        .pendingActivities(filteredActivities)
        .summary(summary)
        .lastUpdated(Timestamp.from(Instant.now()))
        .build();
  }

  private PendingActivityDTO<?> checkKycStatus(User user) {
    User.KYCStatus kycStatus = user.getKycStatus();

    // Check if KYC is not completed
    if (kycStatus != User.KYCStatus.COMPLETED) {
      String title = "Complete KYC Verification";
      String actionUrl = "/api/v1/users/kyc/initiate";

      String description =
          switch (kycStatus) {
            case UNKNOWN, PENDING -> "Complete your KYC verification to start investing";
            case AADHAAR_PENDING -> {
              title = "Complete Aadhaar Verification";
              yield "Link your Aadhaar to complete KYC";
            }
            case E_SIGN_PENDING -> {
              title = "Complete E-Sign";
              yield "Complete the e-signature process to finalize KYC";
            }
            case SUBMITTED -> {
              title = "KYC Under Review";
              yield "Your KYC is being reviewed. You'll be notified once approved";
            }
            case FAILED -> {
              title = "KYC Failed - Retry Required";
              yield "Your KYC verification failed. Please retry with correct details";
            }
            default -> "Complete your KYC to start investing";
          };

      return PendingActivityDTO.builder()
          .id(UUID.randomUUID().toString())
          .type(ActivityType.KYC_INCOMPLETE)
          .title(title)
          .description(description)
          .priority(ActivityPriority.HIGH)
          .createdAt(user.getCreatedAt())
          .metadata(MinifiedUserDTO.fromEntity(user))
          .actionUrl(actionUrl)
          .status("PENDING")
          .build();
    }

    return null;
  }

  private List<PendingActivityDTO<?>> checkPendingGoalPayments(Long userId) {
    List<Goal> pendingGoals =
        goalRepository.findByUserIdAndStatus(userId, Goal.Status.PAYMENT_PENDING);

    return pendingGoals.stream()
        .map(
            goal ->
                PendingActivityDTO.builder()
                    .id(UUID.randomUUID().toString())
                    .type(ActivityType.GOAL_PAYMENT_PENDING)
                    .title("Complete Payment for " + goal.getTitle())
                    .description("Finalize payment to activate your goal")
                    .priority(ActivityPriority.MEDIUM)
                    .createdAt(goal.getCreatedAt())
                    .metadata(GoalDTO.fromEntity(goal))
                    .actionUrl("/api/v1/goals/" + goal.getId() + "/payment")
                    .status("PENDING")
                    .build())
        .collect(Collectors.toList());
  }

  private PendingActivityDTO<?> checkProfileCompletion(User user) {
    // Check if essential profile fields are missing
    boolean isIncomplete =
        user.getFirstName() == null
            || user.getDateOfBirth() == null
            || user.getPanNumber() == null
            || user.getAddress() == null;

    if (isIncomplete) {
      List<String> missingFields = new ArrayList<>();
      if (user.getFirstName() == null) missingFields.add("First Name");
      if (user.getDateOfBirth() == null) missingFields.add("Date of Birth");
      if (user.getPanNumber() == null) missingFields.add("PAN Number");
      if (user.getAddress() == null) missingFields.add("Address");

      return PendingActivityDTO.builder()
          .id(UUID.randomUUID().toString())
          .type(ActivityType.PROFILE_INCOMPLETE)
          .title("Complete Your Profile")
          .description("Fill in missing details to continue: " + String.join(", ", missingFields))
          .priority(ActivityPriority.HIGH)
          .createdAt(user.getCreatedAt())
          .metadata(MinifiedUserDTO.fromEntity(user))
          .actionUrl("/api/v1/users/" + user.getId() + "/profile")
          .status("PENDING")
          .build();
    }

    return null;
  }

  private PendingActivityDTO<?> checkBankAccountStatus(User user) {
    // Check if user has bank details
    if (user.getBankDetails() == null || user.getBankDetails().isEmpty()) {
      return PendingActivityDTO.builder()
          .id(UUID.randomUUID().toString())
          .type(ActivityType.BANK_ACCOUNT_PENDING)
          .title("Add Bank Account")
          .description("Add your bank account details to enable withdrawals")
          .priority(ActivityPriority.MEDIUM)
          .createdAt(user.getCreatedAt())
          .metadata(MinifiedUserDTO.fromEntity(user))
          .actionUrl("/api/v1/users/" + user.getId() + "/bank-details")
          .status("PENDING")
          .build();
    }

    return null;
  }

  private ActivitySummaryDTO buildSummary(List<PendingActivityDTO<?>> activities) {
    Map<ActivityType, Long> byType =
        activities.stream()
            .collect(Collectors.groupingBy(PendingActivityDTO::getType, Collectors.counting()));

    return ActivitySummaryDTO.builder().totalCount(activities.size()).byType(byType).build();
  }

  private PendingActivityResponseDTO buildEmptyResponse(Long userId) {
    return PendingActivityResponseDTO.builder()
        .userId(userId)
        .pendingActivities(Collections.emptyList())
        .summary(ActivitySummaryDTO.builder().totalCount(0).byType(Collections.emptyMap()).build())
        .lastUpdated(Timestamp.from(Instant.now()))
        .build();
  }
}
