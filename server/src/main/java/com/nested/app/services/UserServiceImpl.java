package com.nested.app.services;

import com.nested.app.client.bulkpe.PrefilClient;
import com.nested.app.client.bulkpe.dto.PrefilRequest;
import com.nested.app.client.bulkpe.dto.PrefillResponse;
import com.nested.app.contect.UserContext;
import com.nested.app.dto.UserDTO;
import com.nested.app.entity.Investor;
import com.nested.app.entity.User;
import com.nested.app.repository.InvestorRepository;
import com.nested.app.repository.UserRepository;
import com.nested.app.utils.InvestorUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.api.OpenApiResourceNotFoundException;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

  private final UserRepository userRepository;
  private final InvestorRepository investorRepository;
  private final UserContext userContext;
  private final PrefilClient prefilClient; // inject Bulkpe API client

  @Override
  public List<UserDTO> findAllUsers(Type type, Pageable pageable) {
    Stream<User> users;
    switch (type) {
      case CURRENT_USER:
        users = userRepository.findById(userContext.getUser().getId()).stream();
        break;
      case ACTIVE:
        users = userRepository.findByIsActive(true, pageable).stream();
        break;
      case INACTIVE:
        users = userRepository.findByIsActive(false, pageable).stream();
        break;
      case ALL:
      default:
        users = userRepository.findAll(pageable).stream();
    }
    return users.map(UserDTO::fromEntity).collect(Collectors.toList());
  }

  @Override
  public UserDTO createUser(UserDTO userDTO) {
    // 1. Save user in DB
    User user = UserDTO.fromDto(userDTO);
    User savedUser = userRepository.save(user);

    // 2. Call Prefil API
    PrefilRequest prefilRequest = new PrefilRequest();
    prefilRequest.setName(userDTO.getName());
    prefilRequest.setMobile(userDTO.getPhoneNumber());
    prefilRequest.setReference("ref-" + savedUser.getId()); // generate unique reference

    // Step 3: Call Prefill API
    Mono<PrefillResponse> responseMono = prefilClient.fetchFullDetailsForTheUser(prefilRequest);

    // Step 4: Subscribe async OR block for now (depends on architecture)
    responseMono.subscribe(
            response -> {
              if (response.isStatus()) {
                log.info("Prefill successful for userId={} reference={}", savedUser.getId(), prefilRequest.getReference());

                // Step 5: Map PrefillResponse → Investor entity
                Investor investor = mapToInvestor(response, savedUser);

                // Step 6: Save investor
                investorRepository.save(investor);
                log.info("Investor saved for userId={} with clientCode={}", savedUser.getId(), investor.getClientCode());
              } else {
                log.warn("Prefill failed for userId={} reference={} message={}",
                        savedUser.getId(), prefilRequest.getReference(), response.getMessage());
              }
            },
            error -> log.error("Prefill API call failed for userId={} - {}", savedUser.getId(), error.getMessage(), error)
    );

    return UserDTO.fromEntity(savedUser);

  }


  @Override
  public UserDTO updateUser(UserDTO userDTO) {
    Long userId = userDTO.getId() != null ? Long.parseLong(userDTO.getId()) : null;

    if (userId == null) {
      throw new IllegalArgumentException("User ID must be provided for update");
    }

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new OpenApiResourceNotFoundException("User with id " + userId + " not found"));

    user.setName(userDTO.getName());
    user.setEmail(userDTO.getEmail());
    user.setPhoneNumber(userDTO.getPhoneNumber());

    if (userDTO.getRole() != null) {
      user.setRole(User.Role.valueOf(userDTO.getRole().toUpperCase()));
    }

    User updated = userRepository.save(user);
    return UserDTO.fromEntity(updated);
  }

  /**
   * Helper to map PrefilResponse JSON into Investor entity.
   */
  private Investor mapToInvestor(PrefillResponse response, User savedUser) {
    Investor investor = new Investor();
    var data = response.getData();

    investor.setFirstName(data.getName());  // you may want to split name
    investor.setEmail(savedUser.getEmail());
    investor.setClientCode(data.getReference());
    investor.setPanNumber(
            data.getIdentityInfo() != null && data.getIdentityInfo().getPanNumber() != null
                    && !data.getIdentityInfo().getPanNumber().isEmpty()
                    ? data.getIdentityInfo().getPanNumber().get(0).getIdNumber()
                    : null
    );
    investor.setDateOfBirth(parseDate(data.getPersonalInfo().getDob()));

    return investor;
  }

  //TODO: mohan recheck this
  public Date parseDate(String dateStr) {
    if (dateStr == null || dateStr.isEmpty()) {
      return null;
    }
    LocalDate localDate = LocalDate.parse(dateStr, DateTimeFormatter.ISO_LOCAL_DATE);
    return Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
  }
}
