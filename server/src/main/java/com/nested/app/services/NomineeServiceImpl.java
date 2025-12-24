package com.nested.app.services;

import com.nested.app.dto.NomineeRequestDTO;
import com.nested.app.dto.NomineeResponseDTO;
import com.nested.app.entity.Nominee;
import com.nested.app.entity.User;
import com.nested.app.repository.NomineeRepository;
import com.nested.app.repository.UserRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service implementation for Nominee operations Implements business logic for managing nominees
 * with validation
 *
 * @author Nested App Team
 * @version 1.0
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NomineeServiceImpl implements NomineeService {

  private static final int MAX_NOMINEES = 3;
  private static final int REQUIRED_TOTAL_ALLOCATION = 100;
  private final NomineeRepository nomineeRepository;
  private final UserRepository userRepository;

  @Override
  @Transactional
  public List<NomineeResponseDTO> upsertNominees(List<NomineeRequestDTO> nomineeDTOs, User user) {
    log.info("Upserting nominees for user: {} (count: {})", user.getId(), nomineeDTOs.size());

    // Validate nominee count
    if (nomineeDTOs.isEmpty()) {
      throw new IllegalArgumentException("At least one nominee is required");
    }
    if (nomineeDTOs.size() > MAX_NOMINEES) {
      throw new IllegalArgumentException(
          "Cannot have more than " + MAX_NOMINEES + " nominees per user");
    }

    // Validate each nominee and calculate total allocation
    int totalAllocation = 0;
    for (NomineeRequestDTO dto : nomineeDTOs) {
      // Validate allocation
      validateAllocation(dto.getAllocation());
      totalAllocation += dto.getAllocation();

      // Validate guardian info if minor
      if (isMinor(dto.getDob())) {
        validateGuardianInfo(dto);
      } else {
        // For major, ensure name is provided
        if (dto.getName() == null || dto.getName().isBlank()) {
          throw new IllegalArgumentException("Name is required");
        }
        // PAN is optional but if provided, should be valid format
        validatePanFormat(dto.getPan());
      }
    }

    // Validate total allocation equals 100%
    if (totalAllocation != REQUIRED_TOTAL_ALLOCATION) {
      throw new IllegalArgumentException(
          "Total allocation must equal 100%. Current: " + totalAllocation + "%");
    }

    // Get existing nominees
    List<Nominee> existingNominees = nomineeRepository.findByUserId(user.getId());

    // Process each nominee (create or update)
    List<Nominee> nominees =
        nomineeDTOs.stream()
            .map(
                dto -> {
                  if (dto.getId() == null) {
                    // CREATE new nominee
                    return Nominee.builder()
                        .name(dto.getName())
                        .relationship(dto.getRelationship())
                        .dob(dto.getDob())
                        .pan(dto.getPan())
                        .email(dto.getEmail())
                        .address(dto.getAddress())
                        .guardianName(dto.getGuardianName())
                        .guardianEmail(dto.getGuardianEmail())
                        .guardianPan(dto.getGuardianPan())
                        .guardianAddress(dto.getGuardianAddress())
                        .allocation(dto.getAllocation())
                        .user(user)
                        .build();
                  } else {
                    // UPDATE existing nominee
                    Nominee existing =
                        existingNominees.stream()
                            .filter(n -> n.getId().equals(dto.getId()))
                            .findFirst()
                            .orElseThrow(
                                () ->
                                    new IllegalArgumentException(
                                        "Nominee with ID "
                                            + dto.getId()
                                            + " not found for current user"));

                    // Validate immutable fields
                    if (!existing.getName().equals(dto.getName())) {
                      throw new IllegalArgumentException("Nominee name cannot be updated");
                    }
                    if (!existing.getRelationship().equals(dto.getRelationship())) {
                      throw new IllegalArgumentException("Nominee relationship cannot be updated");
                    }

                    // Update allowed fields
                    existing.setDob(dto.getDob());
                    existing.setPan(dto.getPan());
                    existing.setEmail(dto.getEmail());
                    existing.setAddress(dto.getAddress());
                    existing.setGuardianName(dto.getGuardianName());
                    existing.setGuardianEmail(dto.getGuardianEmail());
                    existing.setGuardianPan(dto.getGuardianPan());
                    existing.setGuardianAddress(dto.getGuardianAddress());
                    existing.setAllocation(dto.getAllocation());

                    return existing;
                  }
                })
            .collect(Collectors.toList());

    // Save all nominees in one transaction
    List<Nominee> saved = nomineeRepository.saveAll(nominees);
    log.info("Nominees upserted successfully: {} total for user: {}", saved.size(), user.getId());

    return saved.stream().map(this::convertToResponseDTO).collect(Collectors.toList());
  }

  @Override
  public List<NomineeResponseDTO> getNominees(User user) {
    log.info("Fetching nominees for user: {}", user.getId());
    return nomineeRepository.findByUserId(user.getId()).stream()
        .map(this::convertToResponseDTO)
        .collect(Collectors.toList());
  }

  @Override
  public NomineeResponseDTO getNominee(Long nomineeId, User user) {
    log.info("Fetching nominee: {} for user: {}", nomineeId, user.getId());
    Nominee nominee =
        nomineeRepository
            .findByUserIdAndId(user.getId(), nomineeId)
            .orElseThrow(() -> new IllegalArgumentException("Nominee not found"));
    return convertToResponseDTO(nominee);
  }

  @Override
  @Transactional
  public void optOutNominee(User user) {
    log.info("User {} opted out of nominee", user.getId());
    user.setNomineeStatus(User.NomineeStatus.OPT_OUT);
    userRepository.save(user);
  }

  /** Convert Nominee entity to NomineeResponseDTO */
  private NomineeResponseDTO convertToResponseDTO(Nominee nominee) {
    return NomineeResponseDTO.builder()
        .id(nominee.getId())
        .name(nominee.getName())
        .relationship(nominee.getRelationship())
        .dob(nominee.getDob())
        .pan(nominee.getPan())
        .email(nominee.getEmail())
        .address(nominee.getAddress())
        .guardianName(nominee.getGuardianName())
        .guardianEmail(nominee.getGuardianEmail())
        .guardianPan(nominee.getGuardianPan())
        .guardianAddress(nominee.getGuardianAddress())
        .allocation(nominee.getAllocation())
        .isMinor(nominee.isMinor())
        .createdAt(nominee.getCreatedAt())
        .updatedAt(nominee.getUpdatedAt())
        .build();
  }

  /** Check if nominee is minor (less than 18 years old) */
  private boolean isMinor(java.util.Date dob) {
    Nominee tempNominee = new Nominee();
    tempNominee.setDob(dob);
    return tempNominee.isMinor();
  }

  /** Validate allocation is a whole number */
  private void validateAllocation(Integer allocation) {
    if (allocation == null || allocation < 1 || allocation > 100) {
      throw new IllegalArgumentException("Allocation must be a whole number between 1 and 100");
    }
  }

  /** Validate guardian information for minors */
  private void validateGuardianInfo(NomineeRequestDTO requestDTO) {
    if (requestDTO.getGuardianName() == null || requestDTO.getGuardianName().isBlank()) {
      throw new IllegalArgumentException("Guardian name is required for minor nominees");
    }
    if (requestDTO.getGuardianPan() == null || requestDTO.getGuardianPan().isBlank()) {
      throw new IllegalArgumentException("Guardian PAN is required for minor nominees");
    }
    validatePanFormat(requestDTO.getGuardianPan());
  }

  /** Validate PAN format (if provided) PAN format: 10 alphanumeric characters */
  private void validatePanFormat(String pan) {
    if (pan != null && !pan.isBlank()) {
      if (!pan.matches("[A-Z]{5}[0-9]{4}[A-Z]{1}")) {
        throw new IllegalArgumentException("Invalid PAN format. Expected: AAAAA0000A");
      }
    }
  }
}
