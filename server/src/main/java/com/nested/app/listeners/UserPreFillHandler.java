package com.nested.app.listeners;

import com.google.common.base.Strings;
import com.nested.app.client.bulkpe.PrefilClient;
import com.nested.app.client.bulkpe.dto.PrefilRequest;
import com.nested.app.client.bulkpe.dto.PrefillResponse;
import com.nested.app.client.meta.LocationApiClient;
import com.nested.app.entity.Address;
import com.nested.app.entity.User;
import com.nested.app.events.UserCreatedEvent;
import com.nested.app.events.UserUpdateEvent;
import com.nested.app.repository.InvestorRepository;
import com.nested.app.repository.UserRepository;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.concurrent.ThreadLocalRandom;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
public record UserPreFillHandler(
    PrefilClient prefilClient,
    InvestorRepository investorRepository,
    UserRepository userRepository,
    LocationApiClient locationApiClient) {

  private static final List<DateTimeFormatter> FORMATTERS =
      List.of(DateTimeFormatter.ofPattern("yyyy-MM-dd"), DateTimeFormatter.ofPattern("dd-MM-yyyy"));

  public static String generateRefId() {
    String timestamp = DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now());
    int randomNum = ThreadLocalRandom.current().nextInt(1000, 9999);
    return "REF-" + timestamp + "-" + randomNum;
  }

  // TODO: mohan recheck this
  public static Date parseDate(String dateStr) {
    for (DateTimeFormatter formatter : FORMATTERS) {
      try {
        LocalDate localDate = LocalDate.parse(dateStr, formatter);
        return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
      } catch (DateTimeParseException ignored) {
      }
    }
    throw new IllegalArgumentException("Invalid date format: " + dateStr);
  }

  @TransactionalEventListener(phase = TransactionPhase.BEFORE_COMMIT)
  public void afterCreate(UserCreatedEvent event) {
    preFillUserData(event.getUser());
  }

  @EventListener
  public void afterUpdate(UserUpdateEvent event) {
    if (Objects.equals(event.oldUser().getFirstName(), event.newUser().getFirstName())
        || event.oldUser().getPrefillStatus().equals(User.PrefillStatus.INCOMPLETE)) {
      preFillUserData(event.newUser());
    }
  }

  void preFillUserData(User user) {
    if (Strings.isNullOrEmpty(user.getFirstName())) {
      log.warn("User name is empty for userId={}, skipping prefill", user.getId());
      return;
    }

    if (Objects.equals(user.getPrefillStatus(), User.PrefillStatus.COMPLETED)) {
      log.info("Prefill already completed for userId={}, skipping prefill", user.getId());
      return;
    }

    log.info("Starting prefill for userId={}", user.getId());
    PrefilRequest prefilRequest = new PrefilRequest();
    prefilRequest.setName(user.getFirstName());
    var phoneNumber = user.getPhoneNumber();
    if (phoneNumber != null && phoneNumber.startsWith("+91")) {
      phoneNumber = phoneNumber.substring(3);
    } else if (phoneNumber != null && phoneNumber.startsWith("91")) {
      phoneNumber = phoneNumber.substring(2);
    }
    prefilRequest.setMobile(phoneNumber);
    // generate unique reference
    prefilRequest.setReference("ref-" + generateRefId());

    // Call Prefill API
    PrefillResponse response = prefilClient.fetchFullDetailsForTheUser(prefilRequest).block();

    if (response == null) {
      log.error(
          "Prefill API returned null response for userId={} reference={}",
          user.getId(),
          prefilRequest.getReference());
      return;
    }

    // Subscribe async OR block for now (depends on architecture)
    if (response.isStatus() && response.getStatusCode() == 200) {
      log.info(
          "Prefill successful for userId={} reference={}",
          user.getId(),
          prefilRequest.getReference());

      // Step 5: Map PrefillResponse → Investor entity
      mapToUser(response, user);

      userRepository.save(user);

      log.info(
          "Prefill data saved for userId={} with clientCode={}",
          user.getId(),
          user.getClientCode());
    } else {
      log.warn(
          "Prefill failed for userId={} reference={} message={}",
          user.getId(),
          prefilRequest.getReference(),
          response.getMessage());
      User.PrefillStatus status = mapPrefillFailureStatus(response);
      userRepository.save(user.withPrefillStatus(status));
    }
  }

  private User.PrefillStatus mapPrefillFailureStatus(PrefillResponse response) {
    if (response.getStatusCode() == 400) {
      return switch (response.getMessage()) {
        case "Data not found in Bureau" ->
            User.PrefillStatus.FAILED_WITH_INVALID_NAME_OR_PHONE_NUMBER;
        case "Input payload validation failed" ->
            User.PrefillStatus.FAILED_WITH_INVALID_PHONE_NUMBER_FORAMATE;
        default -> User.PrefillStatus.UNKNOWN_FAILURE;
      };
    }
    return User.PrefillStatus.UNKNOWN_FAILURE;
  }

  /** Helper to map PrefilResponse JSON into Investor entity. */
  private void mapToUser(PrefillResponse response, User savedUser) {
    var data = response.getData();

    if (savedUser.getFirstName() == null || savedUser.getFirstName().isEmpty()) {
      savedUser.setFirstName(data.getName()); // you may want to split name
    }
    if (savedUser.getEmail() == null) {
      savedUser.setEmail(data.getEmailInfo().getFirst().getEmailAddress().toLowerCase());
    }
    savedUser.setClientCode(data.getReference());
    if (savedUser.getPanNumber() == null) {
      savedUser.setPanNumber(
          data.getIdentityInfo() != null
                  && data.getIdentityInfo().getPanNumber() != null
                  && !data.getIdentityInfo().getPanNumber().isEmpty()
              ? data.getIdentityInfo().getPanNumber().getFirst().getIdNumber()
              : null);
    }
    if (savedUser.getDateOfBirth() == null) {
      savedUser.setDateOfBirth(parseDate(data.getPersonalInfo().getDob()));
    }

    if (data.getAddressInfo() != null && !data.getAddressInfo().isEmpty()) {
      var addressInfo = data.getAddressInfo().getFirst();
      if (addressInfo != null) {
        Address address = new Address();

        address.setAddressLine(addressInfo.getAddress());
        address.setPinCode(addressInfo.getPostal());
        address.setState(addressInfo.getState());
        address.setCountry("IN");

        if (addressInfo.getPostal() != null && !addressInfo.getPostal().isBlank()) {
          try {
            var location = locationApiClient.fetchLocation(addressInfo.getPostal()).block();
            if (location != null) {
              address.setCity(location.getCity());
            }
          } catch (Exception e) {
            log.error("Error while trying to fetch location from API", e);
            address.setCity("");
          }
        }

        savedUser.setAddress(address);
      }
    }

    savedUser.setPrefillStatus(User.PrefillStatus.COMPLETED);
  }
}
