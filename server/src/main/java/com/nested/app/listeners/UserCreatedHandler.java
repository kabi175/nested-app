package com.nested.app.listeners;

import com.nested.app.client.bulkpe.PrefilClient;
import com.nested.app.client.bulkpe.dto.PrefilRequest;
import com.nested.app.client.bulkpe.dto.PrefillResponse;
import com.nested.app.entity.Investor;
import com.nested.app.entity.User;
import com.nested.app.repository.InvestorRepository;
import com.nested.app.services.UserService;
import jakarta.persistence.PostPersist;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public record UserEntityListener(PrefilClient prefilClient, InvestorRepository investorRepository) {

  @PostPersist
  public void afterCreate(User user) {
    preFillUserData(user);
  }

  void preFillUserData(User user) {
    log.info("Starting prefill for userId={}", user.getId());
    PrefilRequest prefilRequest = new PrefilRequest();
    prefilRequest.setName(user.getName());
    prefilRequest.setMobile(user.getPhoneNumber());
    prefilRequest.setReference("ref-" + user.getId()); // generate unique reference

    // Step 3: Call Prefill API
    PrefillResponse response = prefilClient.fetchFullDetailsForTheUser(prefilRequest).block();

    if (response == null) {
      log.error(
          "Prefill API returned null response for userId={} reference={}",
          user.getId(),
          prefilRequest.getReference());
      return;
    }

    // Step 4: Subscribe async OR block for now (depends on architecture)
    if (response.isStatus()) {
      log.info(
          "Prefill successful for userId={} reference={}",
          user.getId(),
          prefilRequest.getReference());

      // Step 5: Map PrefillResponse → Investor entity
      Investor investor = mapToInvestor(response, user);

      // Step 6: Save investor
      investorRepository.save(investor);
      log.info(
          "Investor saved for userId={} with clientCode={}",
          user.getId(),
          investor.getClientCode());
    } else {
      log.warn(
          "Prefill failed for userId={} reference={} message={}",
          user.getId(),
          prefilRequest.getReference(),
          response.getMessage());
    }
  }

  /** Helper to map PrefilResponse JSON into Investor entity. */
  private Investor mapToInvestor(PrefillResponse response, User savedUser) {
    Investor investor = new Investor();
    var data = response.getData();

    investor.setFirstName(data.getName()); // you may want to split name
    investor.setEmail(savedUser.getEmail());
    investor.setClientCode(data.getReference());
    investor.setPanNumber(
        data.getIdentityInfo() != null
                && data.getIdentityInfo().getPanNumber() != null
                && !data.getIdentityInfo().getPanNumber().isEmpty()
            ? data.getIdentityInfo().getPanNumber().getFirst().getIdNumber()
            : null);
    investor.setDateOfBirth(parseDate(data.getPersonalInfo().getDob()));

    return investor;
  }

  // TODO: mohan recheck this
  public Date parseDate(String dateStr) {
    if (dateStr == null || dateStr.isEmpty()) {
      return null;
    }
    LocalDate localDate = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
    return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
  }
}
