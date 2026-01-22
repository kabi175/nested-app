package com.nested.app.services;

import com.nested.app.client.mf.KycVerificationAPIClient;
import com.nested.app.client.mf.dto.KycVerificationRequest;
import com.nested.app.client.mf.dto.KycVerificationResponse;
import com.nested.app.context.UserContext;
import com.nested.app.dto.PreVerificationData;
import com.nested.app.entity.User;
import com.nested.app.entity.UserVerification;
import com.nested.app.repository.UserRepository;
import com.nested.app.repository.UserVerificationRepository;
import java.text.SimpleDateFormat;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.quartz.SchedulerException;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class PreVerificationServiceImpl implements PreVerificationService {
  private final KycVerificationAPIClient kycVerificationAPIClient;
  private final UserVerificationRepository userVerificationRepository;
  private final UserRepository userRepository;
  private final QuartzJobSchedulerService quartzJobSchedulerService;

  public List<PreVerificationData> getVerification(UserContext userContext, Long userID) {
    var user = userRepository.findById(userID).orElseThrow();
    if (user.getKycStatus() == User.KYCStatus.COMPLETED) {
      return List.of();
    }
    var data = userVerificationRepository.findByUser(user);

    if (!data.isEmpty()) {
      refresh(userContext, userID);
      return data.stream().map(PreVerificationData::fromEntity).toList();
    }

    var request =
        KycVerificationRequest.builder()
            .pan(user.getPanNumber())
            .name(user.getFullName())
            .dob(user.getDateOfBirth())
            .build();

    var response = kycVerificationAPIClient.create(request).block();

    if (response == null) {
      return List.of();
    }

    var investVerification =
        UserVerification.builder()
            .entityType(UserVerification.EntityType.READY_TO_INVEST)
            .value(user.getPanNumber())
            .ref(response.getId())
            .status(KycVerificationResponse.RequestStatus.ACCEPTED)
            .user(user)
            .build();
    var nameVerification =
        UserVerification.builder()
            .entityType(UserVerification.EntityType.NAME)
            .value(user.getFullName())
            .ref(response.getId())
            .status(KycVerificationResponse.RequestStatus.ACCEPTED)
            .user(user)
            .build();
    var panVerification =
        UserVerification.builder()
            .entityType(UserVerification.EntityType.PAN)
            .value(user.getPanNumber())
            .ref(response.getId())
            .status(KycVerificationResponse.RequestStatus.ACCEPTED)
            .user(user)
            .build();

    SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");
    String formattedDate = sdf.format(user.getDateOfBirth());

    var dobVerification =
        UserVerification.builder()
            .entityType(UserVerification.EntityType.DOB)
            .value(formattedDate)
            .ref(response.getId())
            .status(KycVerificationResponse.RequestStatus.ACCEPTED)
            .user(user)
            .build();

    var savedData =
        userVerificationRepository.saveAll(
            List.of(nameVerification, panVerification, dobVerification, investVerification));

    // Schedule the PreVerification polling job to run every 5 minutes until verification is
    // complete
    try {
      quartzJobSchedulerService.schedulePreVerificationPollingJob(userID);
      log.info("Scheduled PreVerification polling job for user {}", userID);
    } catch (SchedulerException e) {
      log.error(
          "Failed to schedule PreVerification polling job for user {}: {}",
          userID,
          e.getMessage(),
          e);
      // Don't fail the request if job scheduling fails, just log the error
    }

    return savedData.stream().map(PreVerificationData::fromEntity).toList();
  }

  @Override
  public boolean refresh(UserContext userContext, Long userID) {
    var user = userRepository.findById(userID).orElseThrow();
    var data = userVerificationRepository.findByUser(user);

    if (data.isEmpty()) {
      return true;
    }

    var ref = data.stream().map(UserVerification::getRef).findFirst().orElseThrow();
    var response = kycVerificationAPIClient.fetch(ref).block();

    if (response == null
        || response.getStatus() == KycVerificationResponse.RequestStatus.ACCEPTED) {
      return false;
    }

    var isVerified = true;
    data.forEach(
        userVerification -> {
          userVerification.setStatus(KycVerificationResponse.RequestStatus.COMPLETED);
        });

    if (response.getName() != null) {
      var nameVerification =
          data.stream()
              .filter(
                  userVerification ->
                      userVerification.getEntityType() == UserVerification.EntityType.NAME)
              .findFirst()
              .orElseThrow();
      mapper(response.getName(), nameVerification);
      userVerificationRepository.save(nameVerification);
      isVerified = nameVerification.isVerified();
    }
    if (response.getPan() != null) {
      var panVerification =
          data.stream()
              .filter(
                  userVerification ->
                      userVerification.getEntityType() == UserVerification.EntityType.PAN)
              .findFirst()
              .orElseThrow();
      mapper(response.getPan(), panVerification);
      userVerificationRepository.save(panVerification);
      isVerified = isVerified && panVerification.isVerified();
    }
    if (response.getDob() != null) {
      var dobVerification =
          data.stream()
              .filter(
                  userVerification ->
                      userVerification.getEntityType() == UserVerification.EntityType.DOB)
              .findFirst()
              .orElseThrow();
      mapper(response.getDob(), dobVerification);
      userVerificationRepository.save(dobVerification);
      isVerified = isVerified && dobVerification.isVerified();
    }
    if (response.getReadiness() != null) {
      var investVerification =
          data.stream()
              .filter(
                  userVerification ->
                      userVerification.getEntityType()
                          == UserVerification.EntityType.READY_TO_INVEST)
              .findFirst()
              .orElseThrow();
      mapper(response.getReadiness(), investVerification);
      userVerificationRepository.save(investVerification);
      isVerified = isVerified && investVerification.isVerified();
    }
    if (isVerified) {
      user.setKycStatus(User.KYCStatus.COMPLETED);
      userRepository.save(user);
    }
    return true;
  }

  private void mapper(
      KycVerificationResponse.VerificationObject entity, UserVerification verifyEntity) {
    verifyEntity.setVerified(entity.status == KycVerificationResponse.VerificationStatus.VERIFIED);
    verifyEntity.setErrorCode(entity.code);
  }
}
